import Blog from "../models/postModel.js";
import FolderItem from "../models/folderItemModel.js";
import {
  fetchLeanBlogList,
  parsePagination,
} from "../utils/blogList.js";

const normalizeBookmarks = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((bookmark) => {
      const anchor = bookmark?.anchor;
      return (
        typeof bookmark?.id === "string" &&
        ["red", "green", "yellow", "blue"].includes(bookmark?.color) &&
        Number.isInteger(anchor?.blockIndex) &&
        Number.isFinite(anchor?.startOffset) &&
        Number.isFinite(anchor?.endOffset) &&
        anchor.endOffset > anchor.startOffset
      );
    })
    .map((bookmark) => ({
      id: bookmark.id,
      color: bookmark.color,
      label:
        typeof bookmark.label === "string"
          ? bookmark.label.slice(0, 160)
          : "Bookmark",
      anchor: {
        blockIndex: bookmark.anchor.blockIndex,
        startOffset: bookmark.anchor.startOffset,
        endOffset: bookmark.anchor.endOffset,
      },
      createdAt: Number.isFinite(bookmark.createdAt)
        ? bookmark.createdAt
        : Date.now(),
    }));
};

const generateSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");

const createUniqueSlug = async (title, excludeBlogId = null) => {
  const baseSlug = generateSlug(title) || "untitled-draft";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const query = { slug };
    if (excludeBlogId) {
      query._id = { $ne: excludeBlogId };
    }

    const existingPost = await Blog.findOne(query).select("_id").lean();
    if (!existingPost) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, category, status, mainImage, description, bookmarks } =
      req.body;

    const resolvedStatus = status || "draft";
    const postData = {
      title,
      content,
      bookmarks: normalizeBookmarks(bookmarks),
      author: req.user.id,
      category: category || "general",
      mainImage: mainImage || "",
      status: resolvedStatus,
      ...(description !== undefined && { description }),
      ...(resolvedStatus === "published" ? { publishedAt: new Date() } : {}),
    };

    let slug = await createUniqueSlug(title);
    let savedPost = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const newPost = new Blog({ ...postData, slug });
        savedPost = await newPost.save();
        break;
      } catch (error) {
        if (error.code === 11000 && attempt < 4) {
          const baseSlug = generateSlug(title) || "untitled-draft";
          slug = `${baseSlug}-${Date.now()}-${attempt + 1}`;
          continue;
        }
        throw error;
      }
    }

    if (!savedPost) {
      throw new Error("Failed to create blog after multiple attempts");
    }

    await savedPost.populate("author", "username");

    res.status(201).json({
      message: "Blog Published",
      post: savedPost,
    });
  } catch (error) {
    console.error("Error in Create Blog", error);
    res.status(500).json({
      message: "Error in Post Controller",
      error: error.message,
    });
  }
};

const getUserBlogs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, {
      defaultLimit: 50,
      maxLimit: 100,
    });

    const authorId = req.user._id || req.user.id;

    const { total, blogs, hasMore } = await fetchLeanBlogList({
      Blog,
      filter: { author: authorId },
      skip,
      limit,
      sort: { updatedAt: -1, createdAt: -1 },
    });

    res.status(200).json({
      message: "All Your Blog are fetched",
      blogs,
      page,
      limit,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("Error in getUserBlogs", error);
    res.status(500).json({
      message: "Error in postController",
      error: error.message,
    });
  }
};

const getBlogForEdit = async (req, res) => {
  try {
    const blogId = req.params.id;
    if (!blogId || !/^[0-9a-fA-F]{24}$/.test(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const blog = await Blog.findOne({
      _id: blogId,
      author: req.user.id,
    }).populate("author", "username profileImage");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
      message: "Blog fetched for edit",
      post: blog,
    });
  } catch (error) {
    console.error("Error in getBlogForEdit", error);
    res.status(500).json({
      message: "Error in postController",
      error: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content, category, status, mainImage, description, bookmarks } =
      req.body;
    const blogId = req.params.id;

    const existing = await Blog.findById(blogId).select(
      "author title slug status publishedAt"
    );
    if (!existing) {
      return res.status(404).json({ message: "Blog not found" });
    }
    if (existing.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only update your own blogs" });
    }

    const update = {
      content,
      category,
      status,
      mainImage,
      description,
      bookmarks: normalizeBookmarks(bookmarks),
    };

    if (title !== undefined) {
      update.title = title;
      if (title !== existing.title) {
        update.slug = await createUniqueSlug(title, blogId);
      }
    }

    if (status === "published" && existing.status !== "published") {
      update.publishedAt = existing.publishedAt || new Date();
    }

    const updatePost = await Blog.findByIdAndUpdate(blogId, update, {
      new: true,
    });

    res.status(200).json({
      message: "Blog Updated",
      post: updatePost,
    });
  } catch (error) {
    console.error("Error in updateBlog", error);
    res.status(500).json({
      message: "Error in postController",
      error: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!blogId || !blogId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message:
          "Invalid blog ID format. Blog ID must be a valid MongoDB ObjectId.",
      });
    }

    const blog = await Blog.findOneAndDelete({
      _id: blogId,
      author: req.user.id,
    }).select("_id");

    if (!blog) {
      const exists = await Blog.exists({ _id: blogId });
      if (!exists) {
        return res.status(404).json({ message: "Blog not found" });
      }
      return res
        .status(403)
        .json({ message: "You can only delete your own blogs" });
    }

    await FolderItem.deleteMany({ blog: blogId });

    res.status(200).json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteBlog:", error);

    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message:
          "Invalid blog ID format. Blog ID must be a valid MongoDB ObjectId.",
      });
    }

    res.status(500).json({
      message: "Error in postController",
      error: error.message,
    });
  }
};

export default { createBlog, getUserBlogs, getBlogForEdit, updateBlog, deleteBlog };

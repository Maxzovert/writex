import mongoose from "mongoose";
import Blog from "../models/postModel.js";
import BlogShare from "../models/blogShareModel.js";
import User from "../models/userModel.js";
import {
  fetchLeanBlogList,
  parsePagination,
  shapeListBlog,
  BLOG_LIST_SELECT,
} from "../utils/blogList.js";

const getAllBlogs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const { total, blogs, hasMore } = await fetchLeanBlogList({
      Blog,
      filter: { status: "published" },
      skip,
      limit,
      sort: { publishedAt: -1, createdAt: -1 },
    });

    res.status(200).json({
      message: "Blog fetched",
      allBlogs: blogs,
      page,
      limit,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("Error in getAllBlogs", error);
    res.status(500).json({
      message: "Error in postPublicController",
      error: error.message,
    });
  }
};

const getRelatedBlogs = async (req, res) => {
  try {
    const { category, exclude } = req.query;
    const limit = Math.min(12, Math.max(1, parseInt(req.query.limit, 10) || 5));

    const filter = { status: "published" };
    if (category && category !== "All") {
      const escaped = String(category).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.category = new RegExp(`^${escaped}$`, "i");
    }
    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(exclude) };
    }

    const { blogs } = await fetchLeanBlogList({
      Blog,
      filter,
      skip: 0,
      limit,
      sort: { publishedAt: -1, createdAt: -1 },
    });

    res.status(200).json({
      message: "Related blogs fetched",
      blogs,
    });
  } catch (error) {
    console.error("Error in getRelatedBlogs", error);
    res.status(500).json({
      message: "Error fetching related blogs",
      error: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate(
      "author",
      "username profileImage"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog Not Found" });
    }
    res.status(200).json({
      message: "Blog Found",
      post: blog,
    });
  } catch (error) {
    console.error("Error in getBlogById", error);
    res.status(500).json({
      message: "Failed to fetch error in post public controller",
      error: error.message,
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate(
      "author",
      "username profileImage"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog Not Found" });
    }
    res.status(200).json({
      message: "Blog Finded",
      post: blog,
    });
  } catch (error) {
    console.error("Error in getBlogBySlug", error);
    res.status(500).json({
      message: "Failed to fetch error in post public controller",
      error: error.message,
    });
  }
};

const getFollowingFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page, limit, skip } = parsePagination(req.query);
    const currentUser = await User.findById(userId).select("following");

    if (!currentUser?.following?.length) {
      return res.status(200).json({
        message: "Following feed fetched",
        allBlogs: [],
        sharedBlogs: [],
        page,
        limit,
        total: 0,
        hasMore: false,
      });
    }

    const followingIds = currentUser.following;
    const filter = {
      author: { $in: followingIds },
      status: "published",
    };

    const [{ total, blogs, hasMore }, shares] = await Promise.all([
      fetchLeanBlogList({
        Blog,
        filter,
        skip,
        limit,
        sort: { publishedAt: -1, createdAt: -1 },
      }),
      BlogShare.find({ user: { $in: followingIds } })
        .select("user blog createdAt")
        .populate({
          path: "blog",
          match: { status: "published" },
          select: BLOG_LIST_SELECT,
          populate: { path: "author", select: "username profileImage" },
        })
        .populate("user", "username profileImage")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    const sharedBlogs = shares
      .filter((share) => share.blog)
      .map((share) =>
        shapeListBlog({
          ...share.blog,
          sharedBy: share.user,
          sharedAt: share.createdAt,
        })
      );

    res.status(200).json({
      message: "Following feed fetched",
      allBlogs: blogs,
      sharedBlogs,
      page,
      limit,
      total,
      hasMore,
    });
  } catch (error) {
    console.error("Error in getFollowingFeed", error);
    res.status(500).json({
      message: "Error fetching following feed",
      error: error.message,
    });
  }
};

export default {
  getBlogBySlug,
  getAllBlogs,
  getBlogById,
  getFollowingFeed,
  getRelatedBlogs,
};

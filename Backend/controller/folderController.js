import Blog from "../models/postModel.js";
import BlogFolder from "../models/blogFolderModel.js";
import FolderItem from "../models/folderItemModel.js";

const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

async function getDirectItemCounts(userId) {
  const items = await FolderItem.find({ user: userId }).select("folder").lean();
  const counts = {};
  for (const item of items) {
    const key = item.folder.toString();
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function buildCountLookup(tree) {
  const lookup = {};
  const walk = (node) => {
    lookup[node._id.toString()] = {
      directItemCount: node.directItemCount ?? 0,
      totalItemCount: node.totalItemCount ?? 0,
    };
    node.children?.forEach(walk);
  };
  tree.forEach(walk);
  return lookup;
}

async function isFolderDescendant(folderId, potentialParentId) {
  if (!potentialParentId) return false;
  if (folderId.toString() === potentialParentId.toString()) return true;

  let current = await BlogFolder.findById(potentialParentId).select("parent");
  while (current) {
    if (!current.parent) return false;
    if (current.parent.toString() === folderId.toString()) return true;
    current = await BlogFolder.findById(current.parent).select("parent");
  }
  return false;
}

function sortFolders(folders) {
  return [...folders].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });
}

function buildFolderTree(folders, directCounts, parentId = null) {
  const children = sortFolders(
    folders.filter((f) => {
      const pid = f.parent ? f.parent.toString() : null;
      const target = parentId ? parentId.toString() : null;
      return pid === target;
    })
  );

  return children.map((folder) => {
    const nested = buildFolderTree(folders, directCounts, folder._id);
    const id = folder._id.toString();
    const directItemCount = directCounts[id] || 0;
    const totalItemCount =
      directItemCount + nested.reduce((sum, child) => sum + child.totalItemCount, 0);

    return {
      _id: folder._id,
      name: folder.name,
      parent: folder.parent,
      color: folder.color,
      isPinned: folder.isPinned,
      sortOrder: folder.sortOrder,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      directItemCount,
      totalItemCount,
      children: nested,
    };
  });
}

async function getBreadcrumbs(userId, folderId) {
  if (!folderId) return [{ _id: null, name: "Library" }];

  const crumbs = [];
  let current = await BlogFolder.findOne({ _id: folderId, user: userId });
  while (current) {
    crumbs.unshift({ _id: current._id, name: current.name });
    if (!current.parent) break;
    current = await BlogFolder.findOne({ _id: current.parent, user: userId });
  }
  return [{ _id: null, name: "Library" }, ...crumbs];
}

const getFolderTree = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await BlogFolder.find({ user: userId }).lean();
    const directCounts = await getDirectItemCounts(userId);
    const tree = buildFolderTree(folders, directCounts);

    const filedBlogIds = await FolderItem.find({ user: userId }).distinct("blog");
    const unfiledCount = await Blog.countDocuments({
      author: userId,
      _id: { $nin: filedBlogIds },
      status: { $in: ["draft", "personal", "published"] },
    });
    const filedCount = await FolderItem.countDocuments({ user: userId });

    res.status(200).json({
      tree,
      folders,
      unfiledCount,
      libraryItemCount: filedCount + unfiledCount,
    });
  } catch (error) {
    console.error("getFolderTree", error);
    res.status(500).json({ message: "Failed to fetch folders", error: error.message });
  }
};

const getLibraryContents = async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.query.folderId || null;

    if (folderId && !isValidObjectId(folderId)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }

    let currentFolder = null;
    if (folderId) {
      currentFolder = await BlogFolder.findOne({ _id: folderId, user: userId });
      if (!currentFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const subfoldersRaw = sortFolders(
      await BlogFolder.find({
        user: userId,
        parent: folderId || null,
      }).lean()
    );

    const allFolders = await BlogFolder.find({ user: userId }).lean();
    const directCounts = await getDirectItemCounts(userId);
    const fullTree = buildFolderTree(allFolders, directCounts);
    const countLookup = buildCountLookup(fullTree);

    const subfolders = subfoldersRaw.map((folder) => ({
      ...folder,
      directItemCount: countLookup[folder._id.toString()]?.directItemCount ?? 0,
      totalItemCount: countLookup[folder._id.toString()]?.totalItemCount ?? 0,
    }));

    const currentFolderCounts =
      folderId && countLookup[folderId]
        ? countLookup[folderId]
        : { directItemCount: 0, totalItemCount: 0 };

    const currentFolderWithCounts = currentFolder
      ? {
          ...currentFolder.toObject(),
          ...currentFolderCounts,
        }
      : null;

    const breadcrumbs = await getBreadcrumbs(userId, folderId);

    const folderItems = folderId
      ? await FolderItem.find({ user: userId, folder: folderId })
          .populate({
            path: "blog",
            populate: { path: "author", select: "username profileImage" },
          })
          .lean()
      : [];

    const filedBlogIds = await FolderItem.find({ user: userId }).distinct("blog");

    const unfiledBlogs =
      folderId === null || folderId === undefined || folderId === "null"
        ? await Blog.find({
            author: userId,
            _id: { $nin: filedBlogIds },
            status: { $in: ["draft", "personal", "published"] },
          })
            .populate("author", "username profileImage")
            .sort({ updatedAt: -1 })
            .lean()
        : [];

    res.status(200).json({
      folder: currentFolderWithCounts,
      breadcrumbs,
      subfolders,
      items: folderItems,
      unfiledBlogs,
      unfiledCount: unfiledBlogs.length,
    });
  } catch (error) {
    console.error("getLibraryContents", error);
    res.status(500).json({ message: "Failed to fetch library", error: error.message });
  }
};

const createFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, parentId = null, color = "#BBDEFB", isPinned = false } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    if (parentId) {
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({ message: "Invalid parent folder ID" });
      }
      const parent = await BlogFolder.findOne({ _id: parentId, user: userId });
      if (!parent) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
    }

    const folder = await BlogFolder.create({
      user: userId,
      name: name.trim(),
      parent: parentId || null,
      color,
      isPinned: Boolean(isPinned),
    });

    res.status(201).json({ message: "Folder created", folder });
  } catch (error) {
    console.error("createFolder", error);
    res.status(500).json({ message: "Failed to create folder", error: error.message });
  }
};

const updateFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, color, isPinned, parentId } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }

    const folder = await BlogFolder.findOne({ _id: id, user: userId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (name !== undefined) folder.name = name.trim();
    if (color !== undefined) folder.color = color;
    if (isPinned !== undefined) folder.isPinned = Boolean(isPinned);

    if (parentId !== undefined) {
      if (parentId === null || parentId === "null" || parentId === "") {
        folder.parent = null;
      } else {
        if (!isValidObjectId(parentId)) {
          return res.status(400).json({ message: "Invalid parent folder ID" });
        }
        if (parentId === id) {
          return res.status(400).json({ message: "A folder cannot be its own parent" });
        }
        const parent = await BlogFolder.findOne({ _id: parentId, user: userId });
        if (!parent) {
          return res.status(404).json({ message: "Parent folder not found" });
        }
        const wouldCycle = await isFolderDescendant(id, parentId);
        if (wouldCycle) {
          return res.status(400).json({ message: "Cannot move folder into its own subfolder" });
        }
        folder.parent = parentId;
      }
    }

    await folder.save();
    res.status(200).json({ message: "Folder updated", folder });
  } catch (error) {
    console.error("updateFolder", error);
    res.status(500).json({ message: "Failed to update folder", error: error.message });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid folder ID" });
    }

    const folder = await BlogFolder.findOne({ _id: id, user: userId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const newParent = folder.parent || null;

    await BlogFolder.updateMany(
      { user: userId, parent: id },
      { $set: { parent: newParent } }
    );

    if (newParent) {
      await FolderItem.updateMany(
        { user: userId, folder: id },
        { $set: { folder: newParent } }
      );
    } else {
      await FolderItem.deleteMany({ user: userId, folder: id });
    }

    await BlogFolder.deleteOne({ _id: id, user: userId });

    res.status(200).json({ message: "Folder deleted" });
  } catch (error) {
    console.error("deleteFolder", error);
    res.status(500).json({ message: "Failed to delete folder", error: error.message });
  }
};

const addItemToFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: folderId } = req.params;
    const { blogId, itemType } = req.body;

    if (!isValidObjectId(folderId) || !isValidObjectId(blogId)) {
      return res.status(400).json({ message: "Invalid folder or blog ID" });
    }

    const folder = await BlogFolder.findOne({ _id: folderId, user: userId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const blog = await Blog.findById(blogId).populate("author", "username profileImage");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const isOwner = blog.author._id.toString() === userId.toString();
    let resolvedType = itemType;

    if (isOwner) {
      resolvedType = "own";
    } else {
      if (blog.status !== "published") {
        return res.status(400).json({ message: "Only published blogs can be saved" });
      }
      resolvedType = "saved";
    }

    const item = await FolderItem.findOneAndUpdate(
      { user: userId, blog: blogId },
      { folder: folderId, itemType: resolvedType },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate({
      path: "blog",
      populate: { path: "author", select: "username profileImage" },
    });

    res.status(200).json({ message: "Blog added to folder", item });
  } catch (error) {
    console.error("addItemToFolder", error);
    res.status(500).json({ message: "Failed to add blog to folder", error: error.message });
  }
};

const moveItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId, targetFolderId } = req.body;

    if (!isValidObjectId(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    if (targetFolderId && !isValidObjectId(targetFolderId)) {
      return res.status(400).json({ message: "Invalid target folder ID" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const isOwner = blog.author.toString() === userId.toString();

    if (!targetFolderId) {
      if (!isOwner) {
        return res.status(400).json({ message: "Saved blogs must stay in a folder" });
      }
      await FolderItem.deleteOne({ user: userId, blog: blogId });
      return res.status(200).json({ message: "Blog moved to unfiled" });
    }

    const folder = await BlogFolder.findOne({ _id: targetFolderId, user: userId });
    if (!folder) {
      return res.status(404).json({ message: "Target folder not found" });
    }

    const existing = await FolderItem.findOne({ user: userId, blog: blogId });
    const itemType = existing?.itemType || (isOwner ? "own" : "saved");

    if (!isOwner && itemType === "saved" && blog.status !== "published") {
      return res.status(400).json({ message: "Saved blog is no longer available" });
    }

    const item = await FolderItem.findOneAndUpdate(
      { user: userId, blog: blogId },
      { folder: targetFolderId, itemType },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate({
      path: "blog",
      populate: { path: "author", select: "username profileImage" },
    });

    res.status(200).json({ message: "Blog moved", item });
  } catch (error) {
    console.error("moveItem", error);
    res.status(500).json({ message: "Failed to move blog", error: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;

    if (!isValidObjectId(blogId)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const item = await FolderItem.findOne({ user: userId, blog: blogId });
    if (!item) {
      return res.status(404).json({ message: "Item not found in library" });
    }

    await FolderItem.deleteOne({ _id: item._id });
    res.status(200).json({ message: "Removed from folder" });
  } catch (error) {
    console.error("removeItem", error);
    res.status(500).json({ message: "Failed to remove item", error: error.message });
  }
};

export default {
  getFolderTree,
  getLibraryContents,
  createFolder,
  updateFolder,
  deleteFolder,
  addItemToFolder,
  moveItem,
  removeItem,
};

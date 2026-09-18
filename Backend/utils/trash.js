import Blog from "../models/postModel.js";
import FolderItem from "../models/folderItemModel.js";

/** Soft-deleted posts are kept this long before permanent purge. */
export const TRASH_RETENTION_DAYS = 60;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Match blogs that are not in the recycle bin. */
export const notDeletedFilter = { deletedAt: null };

export function daysUntilPurge(deletedAt) {
  if (!deletedAt) return null;
  const expiresAt = new Date(deletedAt).getTime() + TRASH_RETENTION_MS;
  const remaining = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
}

export function purgeExpiresAt(deletedAt) {
  if (!deletedAt) return null;
  return new Date(new Date(deletedAt).getTime() + TRASH_RETENTION_MS);
}

/**
 * Hard-delete blogs whose deletedAt is older than the retention window.
 * Also removes any leftover folder memberships.
 */
export async function purgeExpiredTrash() {
  const cutoff = new Date(Date.now() - TRASH_RETENTION_MS);
  const expired = await Blog.find({
    deletedAt: { $ne: null, $lte: cutoff },
  })
    .select("_id")
    .lean();

  if (!expired.length) {
    return { purged: 0 };
  }

  const ids = expired.map((b) => b._id);
  await FolderItem.deleteMany({ blog: { $in: ids } });
  const result = await Blog.deleteMany({ _id: { $in: ids } });

  return { purged: result.deletedCount || ids.length };
}

export async function permanentlyDeleteBlog(blogId) {
  await FolderItem.deleteMany({ blog: blogId });
  await Blog.findByIdAndDelete(blogId);
}

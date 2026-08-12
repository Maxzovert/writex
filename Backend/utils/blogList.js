export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 50;

export const BLOG_LIST_PROJECTION = {
  title: 1,
  description: 1,
  mainImage: 1,
  slug: 1,
  author: 1,
  category: 1,
  status: 1,
  readTime: 1,
  publishedAt: 1,
  createdAt: 1,
  updatedAt: 1,
  viewCount: 1,
  likeCount: { $size: { $ifNull: ["$likes", []] } },
  commentCount: { $size: { $ifNull: ["$comments", []] } },
};

/** Fields for mongoose .select() list queries (ObjectId likes only; no content). */
export const BLOG_LIST_SELECT =
  "title description mainImage slug author category status readTime publishedAt createdAt updatedAt viewCount likes";

export function parsePagination(query = {}, { defaultLimit = DEFAULT_PAGE_LIMIT, maxLimit = MAX_PAGE_LIMIT } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function shapeListBlog(blog) {
  const likeCount =
    typeof blog.likeCount === "number"
      ? blog.likeCount
      : Array.isArray(blog.likes)
        ? blog.likes.length
        : 0;
  const commentCount =
    typeof blog.commentCount === "number"
      ? blog.commentCount
      : Array.isArray(blog.comments)
        ? blog.comments.length
        : 0;

  return {
    _id: blog._id,
    title: blog.title,
    description: blog.description,
    mainImage: blog.mainImage,
    slug: blog.slug,
    author: blog.author,
    category: blog.category,
    status: blog.status,
    readTime: blog.readTime,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    viewCount: blog.viewCount || 0,
    likeCount,
    commentCount,
    // Compatibility for clients using likes?.length / comments?.length
    likes: { length: likeCount },
    comments: { length: commentCount },
    ...(blog.sharedBy ? { sharedBy: blog.sharedBy } : {}),
    ...(blog.sharedAt ? { sharedAt: blog.sharedAt } : {}),
  };
}

export async function fetchLeanBlogList({
  Blog,
  filter,
  skip,
  limit,
  sort = { publishedAt: -1, createdAt: -1 },
}) {
  const [total, blogs] = await Promise.all([
    Blog.countDocuments(filter),
    Blog.aggregate([
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      { $project: BLOG_LIST_PROJECTION },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDoc",
          pipeline: [{ $project: { username: 1, profileImage: 1 } }],
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ["$authorDoc", 0] },
        },
      },
      { $project: { authorDoc: 0 } },
    ]),
  ]);

  return {
    total,
    blogs: blogs.map(shapeListBlog),
    hasMore: skip + blogs.length < total,
  };
}

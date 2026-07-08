import axiosInstance from "./axiosConfig"

export interface BlogFolderNode {
  _id: string
  name: string
  parent: string | null
  color: string
  isPinned: boolean
  sortOrder: number
  directItemCount?: number
  totalItemCount?: number
  children?: BlogFolderNode[]
}

export interface LibraryBlog {
  _id: string
  title?: string
  description?: string
  content?: unknown
  status?: string
  category?: string
  mainImage?: string
  viewCount?: number
  createdAt?: string
  updatedAt?: string
  author?: {
    _id?: string
    username?: string
    profileImage?: string
  }
}

export interface FolderItemEntry {
  _id: string
  itemType: "own" | "saved"
  blog: LibraryBlog
  folder: string
}

export interface LibraryContents {
  folder: BlogFolderNode | null
  breadcrumbs: Array<{ _id: string | null; name: string }>
  subfolders: BlogFolderNode[]
  items: FolderItemEntry[]
  unfiledBlogs: LibraryBlog[]
  unfiledCount?: number
}

export interface FolderTreeResponse {
  tree: BlogFolderNode[]
  folders: BlogFolderNode[]
  unfiledCount: number
  libraryItemCount: number
}

export async function fetchFolderTree() {
  const res = await axiosInstance.get("/blog/folders/tree")
  return res.data as FolderTreeResponse
}

export async function fetchLibraryContents(folderId: string | null = null) {
  const query = folderId ? `?folderId=${folderId}` : ""
  const res = await axiosInstance.get(`/blog/library${query}`)
  return res.data as LibraryContents
}

export async function createFolder(payload: {
  name: string
  parentId?: string | null
  color?: string
  isPinned?: boolean
}) {
  const res = await axiosInstance.post("/blog/folders", payload)
  return res.data.folder as BlogFolderNode
}

export async function updateFolder(
  id: string,
  payload: Partial<{
    name: string
    color: string
    isPinned: boolean
    parentId: string | null
  }>
) {
  const res = await axiosInstance.put(`/blog/folders/${id}`, payload)
  return res.data.folder as BlogFolderNode
}

export async function deleteFolder(id: string) {
  await axiosInstance.delete(`/blog/folders/${id}`)
}

export async function addBlogToFolder(
  folderId: string,
  blogId: string,
  itemType?: "own" | "saved"
) {
  const res = await axiosInstance.post(`/blog/folders/${folderId}/items`, {
    blogId,
    itemType,
  })
  return res.data.item as FolderItemEntry
}

export async function moveBlogToFolder(
  blogId: string,
  targetFolderId: string | null
) {
  const res = await axiosInstance.put("/blog/library/move", {
    blogId,
    targetFolderId,
  })
  return res.data
}

export async function removeBlogFromLibrary(blogId: string) {
  await axiosInstance.delete(`/blog/library/items/${blogId}`)
}

export function flattenFolderTree(
  nodes: BlogFolderNode[],
  depth = 0
): Array<BlogFolderNode & { depth: number }> {
  const result: Array<BlogFolderNode & { depth: number }> = []
  for (const node of nodes) {
    result.push({ ...node, depth })
    if (node.children?.length) {
      result.push(...flattenFolderTree(node.children, depth + 1))
    }
  }
  return result
}

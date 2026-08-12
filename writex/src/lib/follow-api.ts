import axiosInstance from "./axiosConfig";

export interface PublicUser {
  _id: string;
  username: string;
  profileImage?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  followerCount: number;
  followingCount: number;
  createdAt?: string;
}

export interface PublicProfileResponse {
  user: PublicUser;
  stats: {
    publishedBlogs: number;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
}

export async function fetchPublicProfile(username: string): Promise<PublicProfileResponse> {
  const { data } = await axiosInstance.get(`/users/public/${encodeURIComponent(username)}`);
  return data;
}

export async function fetchPublicUserBlogs(username: string) {
  const { data } = await axiosInstance.get(`/users/public/${encodeURIComponent(username)}/blogs`);
  return data.blogs ?? [];
}

export async function followUser(userId: string) {
  const { data } = await axiosInstance.post(`/users/${userId}/follow`);
  return data;
}

export async function unfollowUser(userId: string) {
  const { data } = await axiosInstance.delete(`/users/${userId}/follow`);
  return data;
}

export async function fetchFollowers(userId: string) {
  const { data } = await axiosInstance.get(`/users/${userId}/followers`);
  return data.users ?? [];
}

export async function fetchFollowing(userId: string) {
  const { data } = await axiosInstance.get(`/users/${userId}/following`);
  return data.users ?? [];
}

export async function fetchFollowingFeed({ page = 1, limit = 20 } = {}) {
  const { data } = await axiosInstance.get("/public/posts/following", {
    params: { page, limit },
  });
  return {
    allBlogs: data.allBlogs ?? [],
    sharedBlogs: data.sharedBlogs ?? [],
    page: data.page,
    hasMore: data.hasMore,
    total: data.total,
  };
}

export async function shareBlogWithFollowers(blogId: string) {
  const { data } = await axiosInstance.post(`/api/interactions/blog/${blogId}/share`);
  return data;
}

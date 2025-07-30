import type { Attrs, Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";
import axiosInstance from './axiosConfig';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type ProgressCallback = (event: { progress: number }) => void;

export const handleImageUpload = async (
  file: File,
  onProgress?: ProgressCallback,
  abortSignal?: AbortSignal
): Promise<string> => {
  if (!file) {
    throw new Error("No file provided");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axiosInstance.post(
      `${import.meta.env.VITE_API_BASE_URL}/upload/image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        signal: abortSignal,
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.({ progress });
          }
        }
      }
    );

    if (response.data?.url) {
      const imageUrl = `${import.meta.env.VITE_API_BASE_URL}${response.data.url}`;
      console.log("Uploaded image URL:", imageUrl);
      return imageUrl;
    }

    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
};

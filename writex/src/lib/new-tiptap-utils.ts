import type { Attrs, Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";
import { uploadImageToCloudinary, type UploadProgressCallback } from './cloudinary-storage';

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

  try {
    // Convert the progress callback format
    const cloudinaryProgressCallback: UploadProgressCallback = (progress) => {
      onProgress?.({ progress });
    };

    const result = await uploadImageToCloudinary(file, cloudinaryProgressCallback, abortSignal);
    return result.url;
  } catch (error) {
    console.error("Cloudinary image upload failed:", error);
    throw error;
  }
};

export const revokeImageUrl = (_url: string): void => {
  // Hosted URLs; nothing to revoke
};

import type { Attrs, Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";
import { uploadImageToSupabase, type UploadProgressCallback } from './supabase-storage';

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
    const supabaseProgressCallback: UploadProgressCallback = (progress) => {
      onProgress?.({ progress });
    };

    // Upload to Supabase Storage
    const result = await uploadImageToSupabase(file, supabaseProgressCallback, abortSignal);
    
    console.log("Supabase upload successful:", result);
    return result.url;
  } catch (error) {
    console.error("Supabase image upload failed:", error);
    throw error;
  }
};

/**
 * Clean up any resources if needed
 * Note: Supabase handles cleanup automatically
 */
export const revokeImageUrl = (url: string): void => {
  // No cleanup needed for Supabase URLs
  console.log("Image URL cleanup not needed for Supabase");
};

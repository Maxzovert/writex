import type { Attrs, Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";
import { uploadImageToFirebase, type UploadProgressCallback } from './firebase-storage';

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
    const firebaseProgressCallback: UploadProgressCallback = (progress) => {
      onProgress?.({ progress });
    };

    // Upload to Firebase Storage
    const result = await uploadImageToFirebase(file, firebaseProgressCallback, abortSignal);
    
    console.log("Firebase upload successful:", result);
    return result.url;
  } catch (error) {
    console.error("Firebase image upload failed:", error);
    throw error;
  }
};

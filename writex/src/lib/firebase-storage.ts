import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  url: string;
  filename: string;
  path: string;
}

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param onProgress - Optional progress callback
 * @param abortSignal - Optional abort signal for cancellation
 * @returns Promise with upload result containing URL, filename, and path
 */
export const uploadImageToFirebase = async (
  file: File,
  onProgress?: UploadProgressCallback,
  abortSignal?: AbortSignal
): Promise<UploadResult> => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  try {
    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `blog-images/${filename}`);
    
    // Debug: Log storage reference
    console.log('Storage Reference:', {
      bucket: storageRef.bucket,
      fullPath: storageRef.fullPath,
      name: storageRef.name
    });
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Set up progress monitoring
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        throw error;
      }
    );

    // Handle abort signal
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        uploadTask.cancel();
      });
    }

    // Wait for upload to complete
    await uploadTask;
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
    return {
      url: downloadURL,
      filename: filename,
      path: `blog-images/${filename}`
    };
  } catch (error) {
    console.error('Firebase upload failed:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param path - The storage path of the image to delete
 */
export const deleteImageFromFirebase = async (path: string): Promise<void> => {
  try {
    const { deleteObject, ref: storageRef } = await import('firebase/storage');
    const imageRef = storageRef(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
};

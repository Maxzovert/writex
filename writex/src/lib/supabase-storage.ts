import { supabase } from './supabase'

export interface UploadProgressCallback {
  (progress: number): void
}

export interface UploadResult {
  url: string
  filename: string
  path: string
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param onProgress - Optional progress callback
 * @param abortSignal - Optional abort signal for cancellation
 * @returns Promise with upload result containing URL, filename, and path
 */
export const uploadImageToSupabase = async (
  file: File,
  onProgress?: UploadProgressCallback,
  abortSignal?: AbortSignal
): Promise<UploadResult> => {
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB')
  }

  try {
    // Create a unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomId}.${fileExtension}`
    
    // Create storage reference
    const { data, error } = await supabase.storage
      .from('Write-x-img')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('Write-x-img')
      .getPublicUrl(filename)

    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL')
    }

    // Simulate progress (Supabase doesn't provide upload progress)
    if (onProgress) {
      onProgress(100)
    }

    return {
      url: urlData.publicUrl,
      filename: filename,
      path: `Write-x-img/${filename}`
    }
  } catch (error) {
    throw error
  }
}

/**
 * Delete an image from Supabase Storage
 * @param path - The storage path of the image to delete
 */
export const deleteImageFromSupabase = async (path: string): Promise<void> => {
  try {
    const filename = path.split('/').pop()
    if (!filename) {
      throw new Error('Invalid path')
    }

    const { error } = await supabase.storage
      .from('Write-x-img')
      .remove([filename])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Failed to delete image:', error)
    throw error
  }
}

/**
 * List all images in the blog-images bucket
 * @returns Promise with array of image objects
 */
export const listImages = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('Write-x-img')
      .list('', {
        limit: 100,
        offset: 0
      })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to list images:', error)
    throw error
  }
}

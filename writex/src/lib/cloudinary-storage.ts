export interface UploadProgressCallback {
  (progress: number): void
}

export interface UploadResult {
  url: string
  filename: string
  path: string
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const FOLDER = 'writex'

function getCloudinaryConfig(): { cloudName: string; uploadPreset: string } {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined
  if (!cloudName?.trim() || !uploadPreset?.trim()) {
    throw new Error(
      'Missing Cloudinary env vars. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env'
    )
  }
  return { cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() }
}

/**
 * Upload an image to Cloudinary (unsigned, via upload preset).
 */
export const uploadImageToCloudinary = async (
  file: File,
  onProgress?: UploadProgressCallback,
  abortSignal?: AbortSignal
): Promise<UploadResult> => {
  if (!file) {
    throw new Error('No file provided')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig()
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', FOLDER)

    const onAbort = () => {
      xhr.abort()
    }
    if (abortSignal) {
      if (abortSignal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }
      abortSignal.addEventListener('abort', onAbort)
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (abortSignal) {
        abortSignal.removeEventListener('abort', onAbort)
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as {
            secure_url: string
            public_id: string
            format?: string
          }
          if (!data.secure_url) {
            reject(new Error('Upload succeeded but no URL returned'))
            return
          }
          const filename =
            data.format && !data.public_id.endsWith(`.${data.format}`)
              ? `${data.public_id}.${data.format}`
              : data.public_id
          if (onProgress) onProgress(100)
          resolve({
            url: data.secure_url,
            filename,
            path: data.public_id
          })
        } catch {
          reject(new Error('Invalid response from Cloudinary'))
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } }
          reject(new Error(err.error?.message || `Upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`))
        }
      }
    })

    xhr.addEventListener('error', () => {
      if (abortSignal) {
        abortSignal.removeEventListener('abort', onAbort)
      }
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      if (abortSignal) {
        abortSignal.removeEventListener('abort', onAbort)
      }
      reject(new DOMException('Aborted', 'AbortError'))
    })

    xhr.open('POST', url)
    xhr.send(formData)
  })
}

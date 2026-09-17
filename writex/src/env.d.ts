/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_AUTH0_DOMAIN?: string
  readonly VITE_AUTH0_CLIENT_ID?: string
  readonly VITE_AUTH0_AUDIENCE?: string
  readonly VITE_AUTH0_REDIRECT_URI?: string
  readonly VITE_AUTH0_DB_CONNECTION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

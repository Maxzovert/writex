import { mergeAttributes, Node } from "@tiptap/react"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageUploadNode as ImageUploadNodeComponent } from "@/components/tiptap-node/image-upload-node/image-upload-node"

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

export interface ImageUploadNodeOptions {
  /**
   * Acceptable file types for upload.
   * @default 'image/*'
   */
  accept?: string
  /**
   * Maximum number of files that can be uploaded.
   * @default 1
   */
  limit?: number
  /**
   * Maximum file size in bytes (0 for unlimited).
   * @default 0
   */
  maxSize?: number
  /**
   * Function to handle the upload process.
   */
  upload?: UploadFunction,
  /**
   * Callback when upload is complete with array of uploaded image URLs
   */
  onUploadComplete?: (urls: string[]) => void
  /**
   * Callback for upload errors.
   */
  onError?: (error: Error) => void
  /**
   * Callback for successful uploads.
   */
  onSuccess?: (url: string) => void
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: (options?: ImageUploadNodeOptions) => ReturnType
    }
  }
}

/**
 * A TipTap node extension that creates an image upload component.
 * @see registry/tiptap-node/image-upload-node/image-upload-node
 */
export const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  name: "imageUpload",

  group: "block",

  draggable: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      accept: "image/*",
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
    }
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept,
      },
      limit: {
        default: this.options.limit,
      },
      maxSize: {
        default: this.options.maxSize,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "image-upload" }, HTMLAttributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeComponent)
  },

  addCommands() {
    return {
      setImageUploadNode:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  /**
   * Adds Enter key handler to trigger the upload component when it's selected.
   */
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state
        const { nodeAfter } = selection.$from

        if (
          nodeAfter &&
          nodeAfter.type.name === "imageUpload" &&
          editor.isActive("imageUpload")
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos)
          if (nodeEl && nodeEl instanceof HTMLElement) {
            // Since NodeViewWrapper is wrapped with a div, we need to click the first child
            const firstChild = nodeEl.firstChild
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click()
              return true
            }
          }
        }
        return false
      },
    }
  },
})

export default ImageUploadNode

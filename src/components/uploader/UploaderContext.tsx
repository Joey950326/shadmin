import type { ChangeEvent, RefObject } from 'react'
import type { FileWithPreview } from './types'
import { createContext } from 'react'

interface UploaderContextValue {
  files: Array<FileWithPreview>
  isDragOver: boolean
  isUploading: boolean
  accept: string
  multiple: boolean
  maxFiles: number
  maxSize: number
  fileInputRef: RefObject<HTMLInputElement | null>
  addFiles: (newFiles: Array<FileWithPreview> | FileList) => void
  removeFile: (index: number) => void
  handleUpload: () => void
  onUpload?: (files: File[]) => void
  openFileSelect: () => void
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const UploaderContext = createContext<UploaderContextValue | null>(null)

// export default UploaderContext

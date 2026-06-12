import { createContext } from 'react'

interface FileDownloaderContextValue {
  isDownloading: boolean
  download: () => void
}

export const FileDownloaderContext = createContext<FileDownloaderContextValue | null>(null)

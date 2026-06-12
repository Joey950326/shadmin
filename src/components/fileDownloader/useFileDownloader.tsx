import { use } from 'react'
import { FileDownloaderContext } from './FileDownloaderContext'

export function useFileDownloader() {
  const context = use(FileDownloaderContext)
  if (!context) {
    throw new Error('useFileDownloader必须在FileDownloader子组件内使用')
  }
  return context
}

export default useFileDownloader

import { use } from 'react'
import { UploaderContext } from './UploaderContext'

export function useUploader() {
  const context = use(UploaderContext)
  if (!context) {
    throw new Error('useUploader必须在UPloader子组件内使用')
  }
  return context
}

import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { appActions, appSelectors } from '@/store/modules/app'
import i18n from './index'

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const dispatch = useAppDispatch()
  const language = useAppSelector(appSelectors.selectLanguage)

  const setLanguage = useCallback((lang: string) => {
    dispatch(appActions.setLanguage(lang))
  }, [dispatch])

  // 当组件挂载时，检查当前语言设置，如果没有设置则使用 i18n 的当前语言，并确保 i18n 的语言与 Redux 中的语言保持同步
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, setLanguage])

  // 监听 i18next 语言变化 → 同步到 Redux（防止外部修改）
  // useEffect(() => {
  //   const handleLanguageChanged = (lng: string) => {
  //     if (lng !== language) {
  //       setLanguage(lng)
  //     }
  //   }
  //   i18n.on('languageChanged', handleLanguageChanged)

  //   return () => {
  //     i18n.off('languageChanged', handleLanguageChanged)
  //   }
  // }, [language, setLanguage])

  return <>{children}</>
}

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectToken, selectUserInfo, setManualLogout, setToken, setUserInfo } from '@/store/modules/user'

export function useAuth() {
  const userInfo = useAppSelector(selectUserInfo)
  const token = useAppSelector(selectToken)
  const isAuthenticated = !!token // 判断用户是否已认证，简单地检查 token 是否存在
  const dispatch = useAppDispatch()
  const logout = useCallback(() => {
    // 清除用户认证信息（例如，清除 token）
    dispatch(setToken('')) // 假设 setToken 是一个 action 用于更新 token 状态
    dispatch(setUserInfo(null)) // 假设 setUserInfo 是一个 action 用于更新用户信息状态
    dispatch(setManualLogout(true)) // 设置手动登出状态，防止自动重定向到登录页
  }, [dispatch])

  return { isAuthenticated, userInfo, logout }
}

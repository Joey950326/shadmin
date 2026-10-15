import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // 使用 localStorage 进行持久化

interface UserInfo {
  username: string
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isManualLogin: boolean
  isManualLogout: boolean
}

const initialState: UserState = {
  token: null,
  userInfo: null,
  isManualLogin: false,
  isManualLogout: false,
}

// 定义持久化配置
const userPersistConfig = {
  key: 'shadmin-user',
  storage, // 使用 localStorage 进行持久化
  version: 1, // 版本号，默认为1
  whitelist: ['token', 'userInfo'], // 只持久化 token 和 userInfo
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  // 接收action对象，更新状态
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string | null, userInfo: UserInfo | null }>) {
      state.token = action.payload.token
      state.userInfo = action.payload.userInfo
    },

    // 设置token
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },

    // 设置用户信息
    setUserInfo(state, action: PayloadAction<UserInfo | null>) {
      state.userInfo = action.payload
    },

    // 设置是否是手动登录
    setManualLogin(state, action: PayloadAction<boolean>) {
      state.isManualLogin = action.payload
    },
    // 设置是否是手动登出
    setManualLogout(state, action: PayloadAction<boolean>) {
      state.isManualLogout = action.payload
    },
  },
  selectors: {
    // 获取token
    selectToken: user => user.token,
    // 获取用户信息
    selectUserInfo: user => user.userInfo,
    // 获取是否是手动登录
    selectIsManualLogin: user => user.isManualLogin,
    // 获取是否是手动登出
    selectIsManualLogout: user => user.isManualLogout,
  },
})

export const { setCredentials, setToken, setUserInfo, setManualLogin, setManualLogout } = userSlice.actions
export const { selectToken, selectUserInfo, selectIsManualLogin, selectIsManualLogout } = userSlice.selectors

// 使用 persistReducer 包装 userSlice.reducer，使其支持持久化
export const userPersistedReducer = persistReducer(userPersistConfig, userSlice.reducer)

export default userSlice.reducer

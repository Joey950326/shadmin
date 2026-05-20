import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // 使用 localStorage 进行持久化

interface UserInfo {
  name: string
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
}

const initialState: UserState = {
  token: null,
  userInfo: null,
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
    // 设置token
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
    },

    // 设置用户信息
    setUserInfo(state, action: PayloadAction<UserInfo | null>) {
      state.userInfo = action.payload
    },
  },
  selectors: {
    // 获取token
    selectToken: user => user.token,
    // 获取用户信息
    selectUserInfo: user => user.userInfo,
  },
})

export const { setToken, setUserInfo } = userSlice.actions
export const { selectToken, selectUserInfo } = userSlice.selectors

// 使用 persistReducer 包装 userSlice.reducer，使其支持持久化
export const userPersistedReducer = persistReducer(userPersistConfig, userSlice.reducer)

export default userSlice.reducer

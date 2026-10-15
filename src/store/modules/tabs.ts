import type { PayloadAction } from '@reduxjs/toolkit'
import type { RouteTab } from '@/layout/components/routeTabs/types'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { translate } from '@/features/lang/shared'

interface TabsState {
  tabsData: RouteTab[] // 标签页数据
}

const initialState: TabsState = {
  tabsData: [{ title: translate('menu:home'), path: '/home/index', active: true }],
}

const tabsPersistConfig = {
  key: 'shadmin-tabs',
  storage, // 使用 localStorage 进行持久化
  version: 1, // 版本号，默认为1
}

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    updateTabsData(state, action: PayloadAction<RouteTab[]>) {
      state.tabsData = action.payload
    },
  },
  selectors: {
    selectTabsData: tabs => tabs.tabsData,
  },
})

export const { updateTabsData } = tabsSlice.actions
export const { selectTabsData } = tabsSlice.selectors

export const tabsPersistedReducer = persistReducer(tabsPersistConfig, tabsSlice.reducer)

export default tabsSlice.reducer

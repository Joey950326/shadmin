import type { PayloadAction } from '@reduxjs/toolkit'
import type { RouteTabState } from '@/features/routeTabs'
import { createSlice } from '@reduxjs/toolkit'
import { createMigrate, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

interface TabsState {
  tabsData: RouteTabState[]
  pendingClosePath: string | null
}

const initialState: TabsState = {
  tabsData: [{ path: '/home/index', active: true }],
  pendingClosePath: null,
}

const tabsPersistConfig = {
  key: 'shadmin-tabs',
  storage, // 使用 localStorage 进行持久化
  version: 2,
  blacklist: ['pendingClosePath'],
  migrate: createMigrate({
    2: (state: any) => {
      if (!state || !Array.isArray(state.tabsData)) {
        return state
      }
      return {
        ...state,
        tabsData: state.tabsData.map(({ path, active, customTitle }: RouteTabState) => ({
          path,
          ...(active === undefined ? {} : { active }),
          ...(customTitle ? { customTitle } : {}),
        })),
      }
    },
  }),
}

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    updateTabsData(state, action: PayloadAction<RouteTabState[]>) {
      state.tabsData = action.payload
    },
    closeRouteTab(state, action: PayloadAction<{ path: string, nextPath?: string }>) {
      const { path, nextPath } = action.payload
      state.tabsData = state.tabsData
        .filter(tab => tab.path !== path)
        .map(tab => ({ ...tab, active: nextPath ? tab.path === nextPath : tab.active }))
      state.pendingClosePath = nextPath ? path : null
    },
    closeAllRouteTabs(state, action: PayloadAction<string>) {
      state.tabsData = state.tabsData.filter(tab => tab.path === '/home/index')
      state.pendingClosePath = action.payload === '/home/index' ? null : action.payload
    },
    clearPendingClosePath(state) {
      state.pendingClosePath = null
    },
  },
  selectors: {
    selectTabsData: tabs => tabs.tabsData,
  },
})

export const { clearPendingClosePath, closeAllRouteTabs, closeRouteTab, updateTabsData } = tabsSlice.actions
export const { selectTabsData } = tabsSlice.selectors

export const tabsPersistedReducer = persistReducer(tabsPersistConfig, tabsSlice.reducer)

export default tabsSlice.reducer

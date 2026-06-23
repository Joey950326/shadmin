import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export type LayoutType = 'vertical' | 'horizontal' | 'classic' | 'column'

type AssemblemblySize = 'default' | 'small' | 'large'

interface AppState {
  layout: LayoutType // 布局方式
  assemblySize: AssemblemblySize // 组件尺寸
  language: string | null // 语言
  maximize: boolean // 是否最大化
  themeMode: 'light' | 'dark' | 'system' // 主题模式
  primaryColor: string // 主题色
  isDark: boolean // 是否暗黑模式
  isGray: boolean // 是否灰色模式
  isColorWeak: boolean // 是否色弱模式
  asideInverted: boolean // 侧边栏反转
  headerInverted: boolean // 顶部栏反转
  isCollapsed: boolean // 侧边栏是否折叠
  accordion: boolean // 手风琴模式
  showWatermark: boolean // 水印
  showBreadcrumb: boolean // 面包屑
  showBreadcrumbIcon: boolean // 面包屑图标
  showTabs: boolean // 标签页
  tabsReloadFlag: boolean // 标签页刷新标志
  showTabsIcon: boolean // 标签页图标
  showFooter: boolean // 页脚
}

const initialState: AppState = {
  layout: 'vertical',
  assemblySize: 'default',
  language: null,
  maximize: false,
  themeMode: 'light',
  primaryColor: 'rose',
  isDark: false,
  isGray: false,
  isColorWeak: false,
  asideInverted: false,
  headerInverted: false,
  isCollapsed: false,
  accordion: false,
  showWatermark: true,
  showBreadcrumb: true,
  showBreadcrumbIcon: true,
  showTabs: true,
  showTabsIcon: true,
  showFooter: true,
  tabsReloadFlag: true,
}

const appPersistConfig = {
  key: 'shadmin-app',
  storage, // 使用 localStorage 进行持久化
  version: 1, // 版本号，默认为1
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // 设置主题模式
    setThemeMode(state, action: PayloadAction<AppState['themeMode']>) {
      state.themeMode = action.payload
    },

    // 设置主题色
    setPrimaryColor(state, action: PayloadAction<string>) {
      state.primaryColor = action.payload
    },

    // 设置暗黑模式
    setIsDark(state, action: PayloadAction<boolean>) {
      state.isDark = action.payload
    },

    // 设置语言
    setLanguage(state, action: PayloadAction<string | null>) {
      state.language = action.payload
    },

    // 设置app任意状态
    setAppState(state, action: PayloadAction<Partial<AppState>>) {
      return { ...state, ...action.payload }
    },

  },

  selectors: {
    // 获取主题模式
    selectThemeMode: app => app.themeMode,

    // 获取主题色
    selectPrimaryColor: app => app.primaryColor,

    // 获取暗黑模式
    selectIsDark: app => app.isDark,

    // 获取语言
    selectLanguage: app => app.language,

    // 获取整个 app 状态
    selectAppState: app => app,

    // 获取标签页刷新标志
    selectTabsReloadFlag: app => app.tabsReloadFlag,

  },
})

export const { setThemeMode, setPrimaryColor, setIsDark, setLanguage, setAppState } = appSlice.actions
export const { selectThemeMode, selectPrimaryColor, selectIsDark, selectLanguage, selectAppState, selectTabsReloadFlag } = appSlice.selectors

export const appSelectors = appSlice.selectors
export const appActions = appSlice.actions

export const appPersistedReducer = persistReducer(appPersistConfig, appSlice.reducer)

export default appSlice.reducer

import { CaptionsIcon, ChartAreaIcon, ChartColumnBigIcon, ChartLineIcon, ChartPieIcon, ComponentIcon, FileQuestionIcon, FormIcon, GaugeIcon, Grid2x2Icon, Grid3X3Icon, HomeIcon, InfoIcon, KeyIcon, LayersIcon, LinkIcon, ListCollapseIcon, ListPlusIcon, ListTreeIcon, RadarIcon, RadiationIcon, ServerCrashIcon, SettingsIcon, ShieldBanIcon, SparklesIcon, Table2Icon, TableCellsMergeIcon, TagsIcon, TelescopeIcon, TriangleAlertIcon, UsersIcon, WallpaperIcon } from 'lucide-react'
import { createElement } from 'react'

const IconMap: Record<string, React.ComponentType> = {
  'home': HomeIcon,
  'data-screen': TelescopeIcon,
  'table': Table2Icon,
  'proTable': Table2Icon,
  'basicTable': Grid2x2Icon,
  'complexTable': Grid3X3Icon,
  'treeTable': ListTreeIcon,
  'right-manage': KeyIcon,
  'common-component': ComponentIcon,
  'dashboard': GaugeIcon,
  'dataVisualization': WallpaperIcon,
  'form': FormIcon,
  'basicForm': CaptionsIcon,
  'complexForm': TableCellsMergeIcon,
  'dynamicForm': ListPlusIcon,
  'chart': ChartPieIcon,
  'menu-collapse': ListCollapseIcon,
  'system-manage': SettingsIcon,
  'setting': SettingsIcon,
  'users': UsersIcon,
  'tabs': TagsIcon,
  'extral-link': LinkIcon,
  'about': InfoIcon,
  'exception': TriangleAlertIcon,
  'exception-forbidden': ShieldBanIcon,
  'exception-not-found': FileQuestionIcon,
  'exception-server': ServerCrashIcon,
  'system-features': SparklesIcon,
  'barChart': ChartColumnBigIcon,
  'lineChart': ChartLineIcon,
  'areaChart': ChartAreaIcon,
  'pieChart': ChartPieIcon,
  'radarChart': RadarIcon,
  'radialChart': RadiationIcon,
  'other': LayersIcon,
}

/** 目录节点在接口中常不带 icon，按稳定 menu id 补全一级菜单图标 */
const MENU_ID_ICON: Record<string, string> = {
  'menu-home': 'home',
  'menu-dashboard': 'dashboard',
  'menu-table': 'table',
  'menu-form': 'form',
  'menu-chart': 'chart',
  'menu-system': 'system-manage',
  'menu-common': 'common-component',
  'menu-collapse': 'menu-collapse',
  'menu-exception': 'exception',
  'menu-system-features': 'system-features',
  'menu-exception-403': 'exception-forbidden',
  'menu-exception-404': 'exception-not-found',
  'menu-exception-500': 'exception-server',
  'menu-collapse-sub2': 'menu-collapse',
}

export function resolveMenuIconName(icon?: string, menuId?: string): string {
  const trimmed = icon?.trim()
  if (trimmed && IconMap[trimmed]) {
    return trimmed
  }
  if (menuId && MENU_ID_ICON[menuId]) {
    return MENU_ID_ICON[menuId]
  }
  return trimmed || 'other'
}

/** 获取菜单图标 */
export function getMenuIcon(iconName: string): React.ReactNode {
  const IconComponent = IconMap[iconName] || IconMap.other
  return createElement(IconComponent)
}

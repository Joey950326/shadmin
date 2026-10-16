import { CaptionsIcon, ChartAreaIcon, ChartColumnBigIcon, ChartLineIcon, ChartPieIcon, ComponentIcon, FormIcon, GaugeIcon, Grid2x2Icon, Grid3X3Icon, HomeIcon, InfoIcon, KeyIcon, LinkIcon, ListCollapseIcon, ListPlusIcon, ListTreeIcon, MapIcon, RadarIcon, RadiationIcon, SettingsIcon, Table2Icon, TableCellsMergeIcon, TagsIcon, TelescopeIcon, WallpaperIcon } from 'lucide-react'
import { createElement } from 'react'

const IconMap: Record<string, React.ComponentType> = {
  'home': HomeIcon,
  'data-screen': TelescopeIcon,
  'table': Table2Icon,
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
  'tabs': TagsIcon,
  'extral-link': LinkIcon,
  'about': InfoIcon,
  'map': MapIcon,
  'other': MapIcon,
  'barChart': ChartColumnBigIcon,
  'lineChart': ChartLineIcon,
  'areaChart': ChartAreaIcon,
  'pieChart': ChartPieIcon,
  'radarChart': RadarIcon,
  'radialChart': RadiationIcon,

}

/** 获取菜单图标 */
export function getMenuIcon(iconName: string): React.ReactNode {
  const IconComponent = IconMap[iconName] || IconMap.other // 如果没有找到对应的图标，使用默认图标
  return createElement(IconComponent)
}

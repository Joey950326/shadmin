import { ChartAreaIcon, ChartColumnBigIcon, ChartLineIcon, ChartPieIcon, ComponentIcon, FormIcon, GaugeIcon, HomeIcon, InfoIcon, KeyIcon, LinkIcon, ListCollapseIcon, MapIcon, RadarIcon, RadiationIcon, SettingsIcon, Table2Icon, TelescopeIcon } from 'lucide-react'
import { createElement } from 'react'

const IconMap: Record<string, React.ComponentType> = {
  'home': HomeIcon,
  'data-screen': TelescopeIcon,
  'table': Table2Icon,
  'right-manage': KeyIcon,
  'common-component': ComponentIcon,
  'dashboard': GaugeIcon,
  'form': FormIcon,
  'chart': ChartPieIcon,
  'menu-collapse': ListCollapseIcon,
  'system-manage': SettingsIcon,
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

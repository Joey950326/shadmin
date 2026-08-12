// types/watermark.ts
export interface WatermarkOptions {
  /** 水印文本内容，支持字符串或字符串数组（多行） */
  content: string | string[]
  /** 字体大小，默认 16 */
  fontSize?: number
  /** 字体颜色，支持 rgba，默认 'rgba(0,0,0,0.15)' */
  color?: string
  /** 旋转角度（度），默认 -22 */
  rotate?: number
  /** 水平间距，默认 200 */
  gapX?: number
  /** 垂直间距，默认 160 */
  gapY?: number
  /** 整体透明度，0~1，默认 1 */
  opacity?: number
  /** 字体族，默认系统字体 */
  fontFamily?: string
  /** 字体粗细 */
  fontWeight?: string | number
  /** 是否显示（可用于全局开关） */
  //   visible?: boolean
  /** z-index，建议低于 Modal（如 999） */
  zIndex?: number
}

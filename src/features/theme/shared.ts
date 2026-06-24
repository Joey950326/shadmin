/** 应用主题模式 */
export function applyThemeMode(isDark: boolean) {
  // 如果当前主题模式与目标模式相同，则不执行任何操作，避免不必要的 DOM 操作和动画
  if (isDark === isClassNameDark()) {
    return
  }
  // 如果用户偏好减少动画，则直接切换主题类名，避免动画效果，提升用户体验
  const isReduce = getSystemReduce()
  if (isReduce) {
    changeThemeClassName(isDark)
  }
  else {
    const transition = document.startViewTransition(() => {
      changeThemeClassName(isDark)
    })
    // 获取屏幕右上角的坐标位置，作为动画的起点，形成从点击位置扩散的圆形动画
    const x = innerWidth
    const y = 0
    // endRadius 计算为从点击位置到视口最远角落的距离，确保动画覆盖整个屏幕
    const endRadius = Math.hypot(innerWidth, innerHeight)

    // 当过渡准备就绪时，执行动画，根据当前是否为暗黑模式，选择动画的起始和结束状态，形成从点击位置扩散的圆形动画
    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
      document.documentElement.animate(
        {
          // 根据当前是否为暗黑模式，选择动画的起始和结束状态，形成从点击位置扩散的圆形动画
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: 'ease-out',
          // 通过 pseudoElement 指定动画应用于过渡的旧视图或新视图，确保动画效果正确显示
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)',
        },
      )
    })
  }
}

/** 切换主题类名 */
export function changeThemeClassName(isDark: boolean) {
  const root = document.documentElement
  if (isDark) {
    root.classList.add('dark')
  }
  else {
    root.classList.remove('dark')
  }
}

/** 获取系统主题模式 */
export function getSystemThemeMode(): 'light' | 'dark' {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return isDark ? 'dark' : 'light'
}

/** 获取系统是否偏好减少动画 */
export function getSystemReduce(): boolean {
  const isReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return isReduce
}

// 判断当前是否为暗黑模式
export function isClassNameDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

// 切换主题色
export function changeColorClass(color: string) {
  const root = document.documentElement
  const theme_arr = ['theme-blue', 'theme-orange', 'theme-green', 'theme-rose', 'theme-doom', 'theme-pink', 'theme-mocha', 'theme-nature', 'theme-neo']
  root.classList.remove(...theme_arr)
  if (color) {
    root.classList.add(`theme-${color}`)
  }
}

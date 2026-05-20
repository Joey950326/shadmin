// components/TopProgressBar.tsx
import type { LoadingBarRef } from 'react-top-loading-bar'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigation } from 'react-router'
import LoadingBar from 'react-top-loading-bar'

export default function TopProgressBar() {
  const location = useLocation()
  const navigation = useNavigation()
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    if (navigation.state === 'loading') {
      ref.current?.continuousStart(20) // 从 30% 开始更自然
    }
    else {
      ref.current?.complete()
    }
  }, [navigation.state, location.pathname])

  return (
    <LoadingBar
      color="var(--foreground)"
      ref={ref}
      height={3} // 高度
      loaderSpeed={200}
      waitingTime={300}
      shadow={true}
    />
  )
}

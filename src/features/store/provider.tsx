import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import FullScreenLoader from '@/components/LoadingScreen'
import { persistor, store } from '@/store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<FullScreenLoader open text="Loading..." />} persistor={persistor}>
        {children}
      </PersistGate>
    </ReduxProvider>
  )
}

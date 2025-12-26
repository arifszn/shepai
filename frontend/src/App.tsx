import { useState, useLayoutEffect } from 'react'
import LogViewer from './components/LogViewer'
import { Loader2 } from 'lucide-react'
import { getStorageItem } from './lib/utils'

function App() {
  const [initializing, setInitializing] = useState(true)

  useLayoutEffect(() => {
    // Initialize theme from local storage before rendering to prevent flicker
    const shouldBeDark = getStorageItem('darkMode', true)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    setInitializing(false)
  }, [])

  if (initializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <LogViewer />
    </div>
  )
}

export default App


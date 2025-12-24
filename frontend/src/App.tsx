import { useEffect, useState } from 'react'
import LogViewer from './components/LogViewer'

function App() {
  const [source, setSource] = useState<string>('')

  useEffect(() => {
    // Determine source from URL or default to 'file'
    // In a real implementation, this might come from the server
    const urlParams = new URLSearchParams(window.location.search)
    const src = urlParams.get('source') || 'file'
    setSource(src)
  }, [])

  return (
    <div className="h-screen w-screen">
      <LogViewer source={source} />
    </div>
  )
}

export default App


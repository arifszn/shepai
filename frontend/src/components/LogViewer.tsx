import React, { useEffect, useRef, useState, useMemo } from 'react'
import { LogEvent, WebSocketMessage } from '../types/log'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Pause, Play, Search, X, Trash2, Moon, Sun, Eye, EyeOff, ArrowDown } from 'lucide-react'
import Convert from 'ansi-to-html'

interface LogViewerProps {
  source: string
}

export default function LogViewer({ source: _source }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [connected, setConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [_sourceName, setSourceName] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved preference or default to dark
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })
  const wsRef = useRef<WebSocket | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pausedLogsRef = useRef<LogEvent[]>([])

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setConnected(true)
      setIsLoading(false)
    }

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      if (message.type === 'snapshot' && message.events) {
        setLogs(message.events)
        if (message.sourceName) {
          setSourceName(message.sourceName)
          // Update document title with source name
          const name = message.sourceName.split('/').pop() || message.sourceName
          document.title = `${name} - shepai`
        }
      } else if (message.type === 'event' && message.event) {
        if (isPaused) {
          pausedLogsRef.current.push(message.event)
        } else {
          setLogs(prev => [...prev, message.event!])
        }
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
      setIsLoading(false)
    }

    ws.onclose = () => {
      setConnected(false)
      setIsLoading(false)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (autoScroll && !isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll, isPaused])

  const handlePause = () => {
    if (isPaused) {
      // Resume: add paused logs
      setLogs(prev => [...prev, ...pausedLogsRef.current])
      pausedLogsRef.current = []
    }
    setIsPaused(!isPaused)
  }

  const handleClearAll = () => {
    setLogs([])
    pausedLogsRef.current = []
    setSearchQuery('')
  }

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true
    return log.message.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getSeverityColor = (message: string): string => {
    const lower = message.toLowerCase()
    if (lower.includes('error') || lower.includes('fatal') || lower.includes('exception')) {
      return 'text-red-600 dark:text-red-400 font-medium'
    }
    if (lower.includes('warning') || lower.includes('warn')) {
      return 'text-amber-600 dark:text-amber-400'
    }
    if (lower.includes('info') || lower.includes('information')) {
      return 'text-blue-600 dark:text-blue-400'
    }
    if (lower.includes('debug')) {
      return 'text-gray-500 dark:text-gray-400'
    }
    if (lower.includes('success') || lower.includes('ok')) {
      return 'text-green-600 dark:text-green-400'
    }
    return 'text-foreground'
  }

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return timestamp
    }
  }

  // Create ANSI converter that adapts to theme - use useMemo to recreate when theme changes
  const ansiConverter = useMemo(() => {
    return new Convert({
      fg: isDarkMode ? '#E5E7EB' : '#1F2937', // light gray for dark mode, dark gray for light mode
      bg: isDarkMode ? '#0F172A' : '#FFFFFF', // dark bg for dark mode, white for light mode
      newline: false,
      escapeXML: true,
      stream: false
    })
  }, [isDarkMode])

  const renderLogMessage = (text: string, query: string): React.ReactNode => {
    // Convert ANSI codes to HTML
    const html = ansiConverter.toHtml(text)
    
    // If there's a search query, we need to highlight matches
    // But we'll do it after ANSI conversion to preserve colors
    if (!query) {
      return <span dangerouslySetInnerHTML={{ __html: html }} />
    }

    // For search highlighting with ANSI, we'll highlight in the HTML
    const lowerText = text.replace(/\x1b\[[0-9;]*m/g, '').toLowerCase()
    const lowerQuery = query.toLowerCase()
    
    if (!lowerText.includes(lowerQuery)) {
      return <span dangerouslySetInnerHTML={{ __html: html }} />
    }

    // Simple approach: wrap matches in a highlight span
    // This is a simplified version - full ANSI-aware highlighting is complex
    const highlightedHtml = html.replace(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<span class="bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 font-semibold">$1</span>'
    )
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Top Row: Logo and Buttons */}
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Left: shepai title */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-muted-foreground">
                shepai
              </h1>
            </div>

            {/* Right: Compact buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimestamps(!showTimestamps)}
                className="h-8 px-3 text-xs"
              >
                {showTimestamps ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Hide Timestamps</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Show Timestamps</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="h-8 px-3 text-xs"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span className="ml-1.5 hidden md:inline">
                  Auto-scroll: {autoScroll ? "On" : "Off"}
                </span>
              </Button>
              
              <Button
                variant={isPaused ? "default" : "outline"}
                size="sm"
                onClick={handlePause}
                className="h-8 px-3 text-xs"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Pause</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                disabled={logs.length === 0}
                className="h-8 px-3 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="ml-1.5 hidden sm:inline">Clear All</span>
              </Button>
              
              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-8 px-2.5 text-xs ml-2"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-9 text-sm shadow-sm focus:shadow-md transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Connection Status Indicator - Subtle */}
      {!connected && !isLoading && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <p className="text-center text-sm text-destructive flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
            Connection lost. Attempting to reconnect...
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2">
          <p className="text-center text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Connecting to server...
          </p>
        </div>
      )}

      {/* Logs Container */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No matching logs" : "No logs yet"}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery 
                  ? "Try adjusting your search query to find what you're looking for."
                  : "Waiting for log events to arrive..."}
              </p>
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 shadow-md overflow-hidden">
              <div className="divide-y divide-border/30">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 sm:gap-4 py-2 px-3 sm:px-4 hover:bg-muted/30 transition-colors ${getSeverityColor(log.message)}`}
                  >
                    {showTimestamps && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0 pt-0.5 font-medium hidden sm:block">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    )}
                    {showTimestamps && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0 pt-0.5 font-medium sm:hidden">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                    <span className="flex-1 break-words font-mono text-xs sm:text-sm leading-relaxed">
                      {renderLogMessage(log.message, searchQuery)}
                    </span>
                  </div>
                ))}
              </div>
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 backdrop-blur-sm bg-background/95 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{filteredLogs.length}</span>
                {filteredLogs.length === 1 ? 'log' : 'logs'}
              </span>
              {searchQuery && (
                <span className="text-xs">
                  (filtered from {logs.length} total)
                </span>
              )}
              {isPaused && pausedLogsRef.current.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                  <Pause className="w-3 h-3" />
                  {pausedLogsRef.current.length} paused
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Connecting...
                </span>
              ) : (
                <span className={`flex items-center gap-1.5 ${connected ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} ${connected ? 'animate-pulse' : ''}`}></span>
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


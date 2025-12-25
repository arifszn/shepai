import { useEffect, useRef, useState, useMemo } from 'react'
import { LogEvent, WebSocketMessage } from '../../types/log'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Pause, Play, Search, X, Trash2, Moon, Sun, Eye, EyeOff, ArrowDown, ArrowUp, ChevronRight, ChevronDown } from 'lucide-react'
import { LogViewerProps } from './types'
import {
  groupLogEventsForDisplay,
  getSeverityLevel,
  getSeverityColor,
  formatTimestamp,
  tryParseJSON,
  calculateLogLevelCounts
} from './utils'
import { LogLevelBadges } from './LogLevelBadges'
import { LogRenderer } from './LogRenderer'

export default function LogViewer({ source: _source }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [connected, setConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sourceName, setSourceName] = useState<string>('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [jsonViewerEnabled, setJsonViewerEnabled] = useState<Record<string, boolean>>({})
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
  const logsContainerRef = useRef<HTMLElement>(null)

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
    setExpanded({})
    setJsonViewerEnabled({})
  }

  const scrollToTop = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const scrollToBottom = () => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const displayLogs = useMemo(() => groupLogEventsForDisplay(logs), [logs])

  const filteredLogs = displayLogs.filter((log) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const haystack = `${log.header}\n${log.details.join('\n')}`.toLowerCase()
    return haystack.includes(q)
  })

  const levelCounts = useMemo(() => calculateLogLevelCounts(filteredLogs), [filteredLogs])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background/98 to-muted/10">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.3)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Top Row: Logo and Buttons */}
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Left: shepai title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground/90 tracking-tight">
                shepai
              </h1>
              {sourceName && (
                <>
                  <div className="w-px h-5 bg-border/40" />
                  <span className="text-sm text-muted-foreground font-medium">
                    {sourceName}
                  </span>
                </>
              )}
            </div>

            {/* Right: Compact buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimestamps(!showTimestamps)}
                className="h-8 px-3 text-xs"
                title={showTimestamps ? "Hide timestamps" : "Show timestamps"}
              >
                {showTimestamps ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Timestamps</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="ml-1.5 hidden sm:inline">Timestamps</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="h-8 px-3 text-xs"
              >
                Auto-scroll: {autoScroll ? "On" : "Off"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={scrollToTop}
                className="h-8 px-2.5 text-xs"
                title="Scroll to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={scrollToBottom}
                className="h-8 px-2.5 text-xs"
                title="Scroll to bottom"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                className={`h-8 px-3 text-xs ${isPaused ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 hover:text-white dark:hover:text-black border-black dark:border-white' : ''}`}
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
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={logs.length === 0}
                className="h-8 px-3 text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 hover:text-white dark:hover:text-black border-black dark:border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="ml-1.5 hidden sm:inline">Clear All</span>
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-8 px-2.5 text-xs"
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
              className="pl-10 pr-10 h-9 text-sm shadow-[0_1px_2px_0_rgb(0_0_0_0.05)] dark:shadow-[0_1px_2px_0_rgb(0_0_0_0.2)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Connection Status Indicator - Subtle */}
      {!connected && !isLoading && (
        <div className="bg-destructive/5 border-b border-destructive/20 shadow-[inset_0_1px_0_0_rgb(0_0_0_0.05)] px-4 py-2">
          <p className="text-center text-sm text-destructive flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
            Connection lost. Attempting to reconnect...
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-500/5 border-b border-blue-500/20 shadow-[inset_0_1px_0_0_rgb(0_0_0_0.05)] px-4 py-2">
          <p className="text-center text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Connecting to server...
          </p>
        </div>
      )}

      {/* Logs Container */}
      <main ref={logsContainerRef} className="flex-1 overflow-auto">
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
            <div className="bg-card/60 backdrop-blur-md rounded-lg border border-border/40 shadow-[0_4px_6px_-1px_rgb(0_0_0_0.06),0_2px_4px_-2px_rgb(0_0_0_0.04)] dark:shadow-[0_4px_6px_-1px_rgb(0_0_0_0.4),0_2px_4px_-2px_rgb(0_0_0_0.3)] ring-1 ring-border/10 overflow-hidden">
              <div className="divide-y divide-border/20">
                {filteredLogs.map((log) => {
                  const isExpanded = !!expanded[log.key]
                  const hasDetails = log.details.length > 0
                  const severity = getSeverityLevel(log.header)
                  const hasJson = !!tryParseJSON(log.header)
                  const showJsonViewer = jsonViewerEnabled[log.key] !== false // default to true

                  return (
                    <div key={log.key} className="hover:bg-muted/40 hover:shadow-sm transition-all duration-150 ease-in-out">
                      <div
                        className={`flex gap-3 sm:gap-4 py-3 px-4 ${getSeverityColor(log.header)}`}
                      >
                        {showTimestamps && (
                          <span className="text-gray-500 dark:text-gray-400 text-[10px] flex-shrink-0 pt-0.5 font-medium tracking-wide hidden sm:block">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        )}
                        {showTimestamps && (
                          <span className="text-gray-500 dark:text-gray-400 text-[10px] flex-shrink-0 pt-0.5 font-medium tracking-wide sm:hidden">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            {hasDetails ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpanded((prev) => ({
                                    ...prev,
                                    [log.key]: !prev[log.key],
                                  }))
                                }
                                className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center rounded border border-border/50 bg-background/60 hover:bg-accent hover:border-border transition-all duration-150 active:scale-95 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                title={isExpanded ? 'Collapse details' : 'Expand details'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            ) : hasJson ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setJsonViewerEnabled((prev) => ({
                                    ...prev,
                                    [log.key]: prev[log.key] === false ? true : false,
                                  }))
                                }
                                className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center rounded border border-border/50 bg-background/60 hover:bg-accent hover:border-border transition-all duration-150 active:scale-95 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                title={showJsonViewer ? 'Show raw JSON' : 'Show JSON viewer'}
                              >
                                {showJsonViewer ? 'JSON' : 'RAW'}
                              </button>
                            ) : (
                              <span className="w-6 flex-shrink-0" />
                            )}

                            <span className="flex-1 break-words font-mono text-[11px] leading-relaxed">
                              <LogRenderer
                                text={log.header}
                                query={searchQuery}
                                severity={severity}
                                showJsonViewer={showJsonViewer}
                                isDarkMode={isDarkMode}
                              />
                            </span>
                          </div>

                          {hasDetails && isExpanded && (
                            <div className="mt-3 rounded-md border border-border/40 bg-muted/30 dark:bg-muted/20 shadow-inner p-3">
                              <pre className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">
                                <LogRenderer
                                  text={log.details.join('\n')}
                                  query={searchQuery}
                                  severity={severity}
                                  showJsonViewer={showJsonViewer}
                                  isDarkMode={isDarkMode}
                                />
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur-md shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.3)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            {/* Left: Log counts */}
            <div className="flex items-center gap-4 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-semibold text-foreground tracking-tight">{filteredLogs.length}</span>
                {filteredLogs.length === 1 ? 'log' : 'logs'}
              </span>
              {searchQuery && (
                <span className="text-[11px]">
                  (filtered from {displayLogs.length} total)
                </span>
              )}
              {isPaused && pausedLogsRef.current.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                  <Pause className="w-3 h-3" />
                  {pausedLogsRef.current.length} paused
                </span>
              )}
            </div>

            {/* Center: Log level badges */}
            <div className="flex items-center justify-center">
              <LogLevelBadges counts={levelCounts} />
            </div>

            {/* Right: Connection status */}
            <div className="flex items-center gap-2 flex-1 justify-end">
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

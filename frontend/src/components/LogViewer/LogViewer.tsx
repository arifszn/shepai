import { useEffect, useMemo, useRef, useState } from 'react'
import type { LogEvent, WebSocketMessage } from '../../types/log'
import { getStorageItem } from '../../lib/utils'
import { Search } from 'lucide-react'
import { createAnsiConverter } from './utils/ansi'
import { groupLogEventsForDisplay } from './utils/logGrouping'
import { getSeverityLevel } from './utils/severity'
import type { LogLevelCounts } from './types'
import type { LogLevel } from './enums'
import { LogLevel as LogLevelEnum } from './enums'
import { LogViewerHeader } from './components/LogViewerHeader'
import { LogViewerFooter } from './components/LogViewerFooter'
import { LogViewerList } from './components/LogViewerList'

interface LogViewerProps {}

export default function LogViewer({}: LogViewerProps) {
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTimestamps, setShowTimestamps] = useState(() => getStorageItem('logViewer.showTimestamps', true))
  const [stackTraceViewEnabled, setStackTraceViewEnabled] = useState(() => getStorageItem('logViewer.stackTraceViewEnabled', false))
  const [autoScroll, setAutoScroll] = useState(() => getStorageItem('logViewer.autoScroll', true))
  const [connected, setConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sourceName, setSourceName] = useState<string>('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [jsonViewerEnabled, setJsonViewerEnabled] = useState<Record<string, boolean>>({})
  const [jsonViewerGlobalEnabled, setJsonViewerGlobalEnabled] = useState(() => getStorageItem('logViewer.jsonViewerGlobalEnabled', false))
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | null>(null)
  const [focusedLogKey, setFocusedLogKey] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(() => getStorageItem('logViewer.zoomLevel', 1)) // Default zoom level (1 = 100%)
  const [isDarkMode, setIsDarkMode] = useState(() => getStorageItem('darkMode', true))

  const wsRef = useRef<WebSocket | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pausedLogsRef = useRef<LogEvent[]>([])
  const isPausedRef = useRef<boolean>(false)
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

  // Persist other view preferences
  useEffect(() => {
    localStorage.setItem('logViewer.showTimestamps', showTimestamps.toString())
  }, [showTimestamps])

  useEffect(() => {
    localStorage.setItem('logViewer.stackTraceViewEnabled', stackTraceViewEnabled.toString())
  }, [stackTraceViewEnabled])

  useEffect(() => {
    localStorage.setItem('logViewer.autoScroll', autoScroll.toString())
  }, [autoScroll])

  useEffect(() => {
    localStorage.setItem('logViewer.jsonViewerGlobalEnabled', jsonViewerGlobalEnabled.toString())
  }, [jsonViewerGlobalEnabled])

  useEffect(() => {
    localStorage.setItem('logViewer.zoomLevel', zoomLevel.toString())
  }, [zoomLevel])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

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
        if (isPausedRef.current) {
          pausedLogsRef.current.push(message.event)
        } else {
          setLogs((prev) => [...prev, message.event!])
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
      setLogs((prev) => [...prev, ...pausedLogsRef.current])
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
    setSelectedLevel(null)
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

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 1.5)) // Max 150%
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)) // Min 50%
  }

  const displayLogs = useMemo(() => groupLogEventsForDisplay(logs, stackTraceViewEnabled), [logs, stackTraceViewEnabled])

  // First apply search filter only (for counting badges)
  const searchFilteredLogs = useMemo(() => displayLogs.filter((log) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const haystack = `${log.header}\n${log.details.join('\n')}`.toLowerCase()
    return haystack.includes(q)
  }), [displayLogs, searchQuery])

  // Then apply both search and level filters (for display)
  const filteredLogs = useMemo(() => searchFilteredLogs.filter((log) => {
    if (selectedLevel) {
      const level = getSeverityLevel(log.header)
      if (level !== selectedLevel) return false
    }
    return true
  }), [searchFilteredLogs, selectedLevel])

  const levelCounts = useMemo(() => {
    const counts: LogLevelCounts = {
      [LogLevelEnum.ERROR]: 0,
      [LogLevelEnum.WARNING]: 0,
      [LogLevelEnum.INFO]: 0,
      [LogLevelEnum.DEBUG]: 0,
      [LogLevelEnum.SUCCESS]: 0,
      [LogLevelEnum.DEFAULT]: 0,
    }

    // Count from search-filtered logs to reflect search results
    for (const log of searchFilteredLogs) {
      const level = getSeverityLevel(log.header)
      counts[level]++
    }

    return counts
  }, [searchFilteredLogs])

  // Create ANSI converter that adapts to theme - useMemo to recreate when theme changes
  const ansiConverter = useMemo(() => createAnsiConverter(isDarkMode), [isDarkMode])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background/98 to-muted/10">
      <LogViewerHeader
        sourceName={sourceName}
        showTimestamps={showTimestamps}
        onToggleTimestamps={() => setShowTimestamps(!showTimestamps)}
        stackTraceViewEnabled={stackTraceViewEnabled}
        onToggleStackTraceView={() => setStackTraceViewEnabled(!stackTraceViewEnabled)}
        autoScroll={autoScroll}
        onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
        jsonViewerGlobalEnabled={jsonViewerGlobalEnabled}
        onToggleJsonViewerGlobal={() => {
          setJsonViewerGlobalEnabled((prev) => !prev)
          setJsonViewerEnabled({})
        }}
        onScrollTop={scrollToTop}
        onScrollBottom={scrollToBottom}
        isPaused={isPaused}
        onTogglePause={handlePause}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        canClear={logs.length > 0}
        onClearAll={handleClearAll}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

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
        <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{searchQuery ? 'No matching logs' : 'No logs yet'}</h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery ? 'Try adjusting your search query to find what you\'re looking for.' : 'Waiting for log events to arrive...'}
              </p>
            </div>
          ) : (
            <div className="bg-card/60 backdrop-blur-md rounded-lg border border-border/40 shadow-[0_4px_6px_-1px_rgb(0_0_0_0.06),0_2px_4px_-2px_rgb(0_0_0_0.04)] dark:shadow-[0_4px_6px_-1px_rgb(0_0_0_0.4),0_2px_4px_-2px_rgb(0_0_0_0.3)] ring-1 ring-border/10 overflow-hidden">
              <div style={{ zoom: zoomLevel }}>
                <LogViewerList
                  logs={filteredLogs}
                  expanded={expanded}
                  onToggleExpanded={(key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                  jsonViewerEnabled={jsonViewerEnabled}
                  jsonViewerGlobalEnabled={jsonViewerGlobalEnabled}
                  onToggleJsonViewer={(key) => setJsonViewerEnabled((prev) => ({ ...prev, [key]: !(prev[key] ?? jsonViewerGlobalEnabled) }))}
                  focusedLogKey={focusedLogKey}
                  onToggleFocus={(key) => setFocusedLogKey((prev) => (prev !== null ? null : key))}
                  showTimestamps={showTimestamps}
                  searchQuery={searchQuery}
                  isDarkMode={isDarkMode}
                  ansiConverter={ansiConverter}
                />
              </div>
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </main>

      <LogViewerFooter
        filteredCount={filteredLogs.length}
        totalCount={displayLogs.length}
        searchQuery={searchQuery}
        isPaused={isPaused}
        pausedCount={pausedLogsRef.current.length}
        levelCounts={levelCounts}
        selectedLevel={selectedLevel}
        onLevelClick={(level) => setSelectedLevel(selectedLevel === level ? null : level)}
        isLoading={isLoading}
        connected={connected}
      />
    </div>
  )
}



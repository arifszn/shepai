import React, { useEffect, useRef, useState, useMemo } from 'react'
import { LogEvent, WebSocketMessage } from '../types/log'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Pause, Play, Search, X, Trash2, Moon, Sun, Eye, EyeOff, ArrowDown, ArrowUp, ChevronRight, ChevronDown, XCircle, AlertTriangle, Info, Bug, CheckCircle, Circle } from 'lucide-react'
import Convert from 'ansi-to-html'
import JsonView from '@uiw/react-json-view'

interface LogViewerProps {
  source: string
}

type DisplayLogEvent = {
  key: string
  timestamp: string
  source: LogEvent['source']
  stream: LogEvent['stream']
  header: string
  details: string[] // continuation lines (e.g. stack frames)
}

type LogLevelCounts = {
  error: number
  warning: number
  info: number
  debug: number
  success: number
  default: number
}

const looksLikeNewEntryLine = (line: string): boolean => {
  // Common prefixes that strongly indicate a new log entry (not a continuation)
  // - [2025-12-25 06:12:46] ...
  // - 2025-12-25 06:12:46 ...
  // - 2025-12-25T06:12:46Z ...
  const trimmed = line.trimStart()

  if (trimmed.startsWith('[shepai]')) return true

  const bracketed = /^\[\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?\]/.test(trimmed)
  if (bracketed) return true

  const plain = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?/.test(trimmed)
  if (plain) return true

  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/.test(trimmed)
  if (iso) return true

  return false
}

const looksLikeContinuationLine = (line: string): boolean => {
  // Generic heuristics for stack traces / multi-line continuations across ecosystems.
  // Keep this conservative to avoid accidentally merging unrelated logs.
  if (!line) return false

  const trimmed = line.trimStart()

  // Standalone closing punctuation lines (often appear as the "closing line" of a multi-line
  // serialized payload, e.g. JSON that started on a previous line). We treat these as
  // continuations so they don't show up as their own log entry.
  // Examples: `}`, `]`, `)`, `"}`, `"]`, `"}"` (optionally with a trailing comma/semicolon)
  if (/^[\s"'\]\)\}]+[,;]?\s*$/.test(line)) return true

  // Indented lines are usually continuations
  if (/^\s+/.test(line)) return true

  // PHP/Laravel stack frames: "#0 /path:line ..."
  if (/^#\d+\s+/.test(trimmed)) return true

  // JS stack frames: "at func (file:line:col)"
  if (/^at\s+\S+/.test(trimmed)) return true

  // Explicit stack-trace markers
  if (/^\[stacktrace\]\s*$/i.test(trimmed)) return true
  if (/^stack\s+trace:?/i.test(trimmed)) return true
  if (/^traceback\s+\(most\s+recent\s+call\s+last\):/i.test(trimmed)) return true

  // Common exception chaining lines
  if (/^(caused by:|during handling of the above exception)/i.test(trimmed)) return true

  // Go panics often continue with "goroutine ..."
  if (/^goroutine\s+\d+\s+\[.*\]:/i.test(trimmed)) return true
  if (/^panic:\s+/i.test(trimmed)) return true

  return false
}

const groupLogEventsForDisplay = (events: LogEvent[]): DisplayLogEvent[] => {
  const out: DisplayLogEvent[] = []
  let counter = 0

  for (const ev of events) {
    const line = ev.message ?? ''
    const shouldStartNew =
      looksLikeNewEntryLine(line) ||
      out.length === 0 ||
      !looksLikeContinuationLine(line)

    if (shouldStartNew) {
      const key = `${ev.timestamp}::${counter++}`
      out.push({
        key,
        timestamp: ev.timestamp,
        source: ev.source,
        stream: ev.stream,
        header: line,
        details: [],
      })
      continue
    }

    // Append as continuation
    out[out.length - 1].details.push(line)
  }

  return out
}

const tryParseJSON = (text: string): any | null => {
  try {
    // Trim whitespace
    const trimmed = text.trim()

    // Must start with { or [ to be JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return null
    }

    const parsed = JSON.parse(trimmed)

    // Only return if it's an object or array (not primitives)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

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

  const getSeverityLevel = (message: string): 'error' | 'warning' | 'info' | 'debug' | 'success' | 'default' => {
    const lower = message.toLowerCase()
    if (lower.includes('error') || lower.includes('fatal') || lower.includes('exception')) {
      return 'error'
    }
    if (lower.includes('warning') || lower.includes('warn')) {
      return 'warning'
    }
    if (lower.includes('info') || lower.includes('information')) {
      return 'info'
    }
    if (lower.includes('debug')) {
      return 'debug'
    }
    if (lower.includes('success') || lower.includes('ok')) {
      return 'success'
    }
    return 'default'
  }

  const displayLogs = useMemo(() => groupLogEventsForDisplay(logs), [logs])

  const filteredLogs = displayLogs.filter((log) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const haystack = `${log.header}\n${log.details.join('\n')}`.toLowerCase()
    return haystack.includes(q)
  })

  const levelCounts = useMemo(() => {
    const counts: LogLevelCounts = {
      error: 0,
      warning: 0,
      info: 0,
      debug: 0,
      success: 0,
      default: 0,
    }

    for (const log of filteredLogs) {
      const level = getSeverityLevel(log.header)
      counts[level]++
    }

    return counts
  }, [filteredLogs])

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

  const renderLogMessage = (text: string, query: string, severity?: 'error' | 'warning' | 'info' | 'debug' | 'success' | 'default', showJsonViewer?: boolean): React.ReactNode => {
    // Try to parse as JSON first
    const jsonData = tryParseJSON(text)

    if (jsonData && showJsonViewer) {
      // Get severity-based key color
      const getSeverityKeyColor = () => {
        if (!severity || severity === 'default') {
          return isDarkMode ? '#93C5FD' : '#1D4ED8'
        }

        const colorMap = {
          error: isDarkMode ? '#F87171' : '#DC2626',
          warning: isDarkMode ? '#FBBF24' : '#D97706',
          info: isDarkMode ? '#60A5FA' : '#2563EB',
          debug: isDarkMode ? '#9CA3AF' : '#6B7280',
          success: isDarkMode ? '#34D399' : '#059669',
          default: isDarkMode ? '#93C5FD' : '#1D4ED8',
        }

        return colorMap[severity]
      }

      // Render as JSON viewer with theme-aware colors
      return (
        <div className="my-1">
          <JsonView
            value={jsonData}
            collapsed={false}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            shortenTextAfterLength={0}
            style={{
              backgroundColor: 'transparent',
              fontSize: '11px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              ...(isDarkMode ? {
                '--w-rjv-color': '#E5E7EB',
                '--w-rjv-key-string': getSeverityKeyColor(),
                '--w-rjv-background-color': 'transparent',
                '--w-rjv-line-color': '#374151',
                '--w-rjv-arrow-color': 'transparent',
                '--w-rjv-edit-color': '#60A5FA',
                '--w-rjv-info-color': '#6B7280',
                '--w-rjv-update-color': '#34D399',
                '--w-rjv-copied-color': '#10B981',
                '--w-rjv-copied-success-color': '#059669',
                '--w-rjv-curlybraces-color': '#9CA3AF',
                '--w-rjv-colon-color': '#6B7280',
                '--w-rjv-brackets-color': '#9CA3AF',
                '--w-rjv-quotes-color': '#6B7280',
                '--w-rjv-quotes-string-color': '#E5E7EB',
                '--w-rjv-type-string-color': '#E5E7EB',
                '--w-rjv-type-int-color': '#93C5FD',
                '--w-rjv-type-float-color': '#93C5FD',
                '--w-rjv-type-bigint-color': '#93C5FD',
                '--w-rjv-type-boolean-color': '#C4B5FD',
                '--w-rjv-type-date-color': '#A78BFA',
                '--w-rjv-type-url-color': '#60A5FA',
                '--w-rjv-type-null-color': '#9CA3AF',
                '--w-rjv-type-nan-color': '#9CA3AF',
                '--w-rjv-type-undefined-color': '#6B7280',
              } : {
                '--w-rjv-color': '#1F2937',
                '--w-rjv-key-string': getSeverityKeyColor(),
                '--w-rjv-background-color': 'transparent',
                '--w-rjv-line-color': '#E5E7EB',
                '--w-rjv-arrow-color': 'transparent',
                '--w-rjv-edit-color': '#2563EB',
                '--w-rjv-info-color': '#9CA3AF',
                '--w-rjv-update-color': '#059669',
                '--w-rjv-copied-color': '#10B981',
                '--w-rjv-copied-success-color': '#047857',
                '--w-rjv-curlybraces-color': '#6B7280',
                '--w-rjv-colon-color': '#9CA3AF',
                '--w-rjv-brackets-color': '#6B7280',
                '--w-rjv-quotes-color': '#9CA3AF',
                '--w-rjv-quotes-string-color': '#1F2937',
                '--w-rjv-type-string-color': '#1F2937',
                '--w-rjv-type-int-color': '#2563EB',
                '--w-rjv-type-float-color': '#2563EB',
                '--w-rjv-type-bigint-color': '#2563EB',
                '--w-rjv-type-boolean-color': '#7C3AED',
                '--w-rjv-type-date-color': '#7C3AED',
                '--w-rjv-type-url-color': '#2563EB',
                '--w-rjv-type-null-color': '#6B7280',
                '--w-rjv-type-nan-color': '#6B7280',
                '--w-rjv-type-undefined-color': '#9CA3AF',
              }),
            } as any}
          />
        </div>
      )
    }

    // Convert ANSI codes to HTML
    const html = ansiConverter.toHtml(text)

    // If there's a search query, we need to highlight matches
    // But we'll do it after ANSI conversion to preserve colors
    if (!query) {
      return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
    }

    // For search highlighting with ANSI, we'll highlight in the HTML
    const lowerText = text.replace(/\x1b\[[0-9;]*m/g, '').toLowerCase()
    const lowerQuery = query.toLowerCase()

    if (!lowerText.includes(lowerQuery)) {
      return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
    }

    // Simple approach: wrap matches in a highlight span
    // This is a simplified version - full ANSI-aware highlighting is complex
    const highlightedHtml = html.replace(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<span class="bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 font-semibold">$1</span>'
    )

    return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
  }

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
                {filteredLogs.map((log, index) => {
                  const isExpanded = !!expanded[log.key]
                  const hasDetails = log.details.length > 0
                  const severity = getSeverityLevel(log.header)
                  const hasJson = !!tryParseJSON(log.header)
                  const showJsonViewer = jsonViewerEnabled[log.key] !== false // default to true

                  return (
                    <div key={log.key} className={`hover:bg-muted/90 dark:hover:bg-muted/90 hover:shadow-sm transition-all duration-150 ease-in-out ${index % 2 === 0 ? 'bg-muted/60 dark:bg-muted/60' : 'bg-transparent'}`}>
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
                              {renderLogMessage(log.header, searchQuery, severity, showJsonViewer)}
                            </span>
                          </div>

                          {hasDetails && isExpanded && (
                            <div className="mt-3 rounded-md border border-border/40 bg-muted/30 dark:bg-muted/20 shadow-inner p-3">
                              <pre className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">
                                {renderLogMessage(log.details.join('\n'), searchQuery, severity, showJsonViewer)}
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

interface LogLevelBadgesProps {
  counts: LogLevelCounts
}

const LogLevelBadges = ({ counts }: LogLevelBadgesProps) => {
  const badges = [
    { level: 'error', icon: XCircle, count: counts.error, color: 'text-red-600/60 dark:text-red-400/50 bg-red-50/40 dark:bg-red-950/10 border-red-200/30 dark:border-red-900/20' },
    { level: 'warning', icon: AlertTriangle, count: counts.warning, color: 'text-amber-600/60 dark:text-amber-400/50 bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/30 dark:border-amber-900/20' },
    { level: 'info', icon: Info, count: counts.info, color: 'text-blue-600/60 dark:text-blue-400/50 bg-blue-50/40 dark:bg-blue-950/10 border-blue-200/30 dark:border-blue-900/20' },
    { level: 'debug', icon: Bug, count: counts.debug, color: 'text-gray-500/60 dark:text-gray-400/50 bg-gray-50/40 dark:bg-gray-950/10 border-gray-200/30 dark:border-gray-900/20' },
    { level: 'success', icon: CheckCircle, count: counts.success, color: 'text-green-600/60 dark:text-green-400/50 bg-green-50/40 dark:bg-green-950/10 border-green-200/30 dark:border-green-900/20' },
    { level: 'default', icon: Circle, count: counts.default, color: 'text-gray-400/60 dark:text-gray-500/50 bg-gray-50/40 dark:bg-gray-900/10 border-gray-300/30 dark:border-gray-700/20' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map(({ level, icon: Icon, count, color }) => (
        count > 0 && (
          <div key={level} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shadow-sm cursor-default ${color}`} title={`${count} ${level}`}>
            <Icon className="w-3 h-3" />
            <span className="text-[9px] font-semibold">{count}</span>
          </div>
        )
      ))}
    </div>
  )
}


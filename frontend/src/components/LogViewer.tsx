import React, { useEffect, useRef, useState } from 'react'
import { LogEvent, WebSocketMessage } from '../types/log'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Pause, Play, Search, X, Trash2 } from 'lucide-react'

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
  const wsRef = useRef<WebSocket | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const pausedLogsRef = useRef<LogEvent[]>([])

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      if (message.type === 'snapshot' && message.events) {
        setLogs(message.events)
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
    }

    ws.onclose = () => {
      setConnected(false)
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
      return 'text-red-400'
    }
    if (lower.includes('warning') || lower.includes('warn')) {
      return 'text-yellow-400'
    }
    if (lower.includes('info') || lower.includes('information')) {
      return 'text-blue-400'
    }
    if (lower.includes('debug')) {
      return 'text-gray-400'
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

  const highlightSearchText = (text: string, query: string): React.ReactNode => {
    if (!query) {
      return <span>{text}</span>
    }

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let index = lowerText.indexOf(lowerQuery, lastIndex)

    while (index !== -1) {
      // Add text before match
      if (index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, index)}</span>)
      }
      // Add highlighted match
      parts.push(
        <span key={`match-${index}`} className="bg-yellow-500/30 text-yellow-200 font-semibold">
          {text.substring(index, index + query.length)}
        </span>
      )
      lastIndex = index + query.length
      index = lowerText.indexOf(lowerQuery, lastIndex)
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>)
    }

    return <>{parts}</>
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">shepai</h1>
            <Badge variant={connected ? "default" : "destructive"}>
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimestamps(!showTimestamps)}
            >
              {showTimestamps ? "Hide" : "Show"} Timestamps
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
            >
              Auto-scroll: {autoScroll ? "On" : "Off"}
            </Button>
            <Button
              variant={isPaused ? "default" : "outline"}
              size="sm"
              onClick={handlePause}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="ml-2">{isPaused ? "Resume" : "Pause"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={logs.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              <span className="ml-2">Clear All</span>
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery ? "No logs match your search" : "No logs yet..."}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`flex gap-4 py-1 hover:bg-muted/50 rounded px-2 ${getSeverityColor(log.message)}`}
              >
                {showTimestamps && (
                  <span className="text-muted-foreground text-xs flex-shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                )}
                <span className="flex-1 break-words">
                  {highlightSearchText(log.message, searchQuery)}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-2 text-xs text-muted-foreground text-center">
        {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
        {searchQuery && ` (filtered from ${logs.length} total)`}
        {isPaused && ` • ${pausedLogsRef.current.length} paused`}
      </div>
    </div>
  )
}


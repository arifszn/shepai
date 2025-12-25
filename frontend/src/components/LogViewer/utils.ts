import { LogEvent } from '../../types/log'
import { DisplayLogEvent, SeverityLevel, LogLevelCounts } from './types'

export const looksLikeNewEntryLine = (line: string): boolean => {
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

export const looksLikeContinuationLine = (line: string): boolean => {
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

export const groupLogEventsForDisplay = (events: LogEvent[]): DisplayLogEvent[] => {
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

export const tryParseJSON = (text: string): any | null => {
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

export const getSeverityLevel = (message: string): SeverityLevel => {
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

export const getSeverityColor = (message: string): string => {
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

export const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return timestamp
  }
}

export const calculateLogLevelCounts = (logs: DisplayLogEvent[]): LogLevelCounts => {
  const counts: LogLevelCounts = {
    error: 0,
    warning: 0,
    info: 0,
    debug: 0,
    success: 0,
    default: 0,
  }

  for (const log of logs) {
    const level = getSeverityLevel(log.header)
    counts[level]++
  }

  return counts
}

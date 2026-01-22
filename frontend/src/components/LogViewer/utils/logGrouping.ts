import type { LogEvent } from '../../../types/log'
import type { DisplayLogEvent } from '../types'

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

export const groupLogEventsForDisplay = (events: LogEvent[], groupingEnabled: boolean = true): DisplayLogEvent[] => {
  const out: DisplayLogEvent[] = []
  let counter = 0

  for (const ev of events) {
    const line = ev.message ?? ''
    
    // If grouping is disabled, every line starts a new entry
    const shouldStartNew = !groupingEnabled || 
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



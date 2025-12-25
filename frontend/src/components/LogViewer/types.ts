import { LogEvent } from '../../types/log'

export interface LogViewerProps {
  source: string
}

export type DisplayLogEvent = {
  key: string
  timestamp: string
  source: LogEvent['source']
  stream: LogEvent['stream']
  header: string
  details: string[] // continuation lines (e.g. stack frames)
}

export type LogLevelCounts = {
  error: number
  warning: number
  info: number
  debug: number
  success: number
  default: number
}

export type SeverityLevel = 'error' | 'warning' | 'info' | 'debug' | 'success' | 'default'

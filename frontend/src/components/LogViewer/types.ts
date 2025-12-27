import type { LogEvent } from '../../types/log'
import type { LogLevel } from './enums'

export type DisplayLogEvent = {
  key: string
  timestamp: string
  source: LogEvent['source']
  stream: LogEvent['stream']
  header: string
  details: string[] // continuation lines (e.g. stack frames)
}

export type LogLevelCounts = Record<LogLevel, number>



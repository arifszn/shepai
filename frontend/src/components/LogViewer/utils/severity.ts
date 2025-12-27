import type { LogLevel } from '../enums'
import { LogLevel as LogLevelEnum } from '../enums'

export const getSeverityLevel = (message: string): LogLevel => {
  const lower = message.toLowerCase()
  if (lower.includes('error') || lower.includes('fatal') || lower.includes('exception')) {
    return LogLevelEnum.ERROR
  }
  if (lower.includes('warning') || lower.includes('warn')) {
    return LogLevelEnum.WARNING
  }
  if (lower.includes('info') || lower.includes('information')) {
    return LogLevelEnum.INFO
  }
  if (lower.includes('debug')) {
    return LogLevelEnum.DEBUG
  }
  if (lower.includes('success') || lower.includes('ok')) {
    return LogLevelEnum.SUCCESS
  }
  return LogLevelEnum.DEFAULT
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

export const getSeverityKeyColor = (severity: LogLevel | undefined, isDarkMode: boolean): string => {
  if (!severity || severity === LogLevelEnum.DEFAULT) {
    return isDarkMode ? '#93C5FD' : '#1D4ED8'
  }

  const colorMap: Record<LogLevel, string> = {
    [LogLevelEnum.ERROR]: isDarkMode ? '#F87171' : '#DC2626',
    [LogLevelEnum.WARNING]: isDarkMode ? '#FBBF24' : '#D97706',
    [LogLevelEnum.INFO]: isDarkMode ? '#60A5FA' : '#2563EB',
    [LogLevelEnum.DEBUG]: isDarkMode ? '#9CA3AF' : '#6B7280',
    [LogLevelEnum.SUCCESS]: isDarkMode ? '#34D399' : '#059669',
    [LogLevelEnum.DEFAULT]: isDarkMode ? '#93C5FD' : '#1D4ED8',
  }

  return colorMap[severity]
}



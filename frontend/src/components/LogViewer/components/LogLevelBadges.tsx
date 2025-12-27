import { AlertTriangle, Bug, CheckCircle, Circle, Info, XCircle } from 'lucide-react'
import type { LogLevel } from '../enums'
import { LogLevel as LogLevelEnum } from '../enums'
import type { LogLevelCounts } from '../types'

interface LogLevelBadgesProps {
  counts: LogLevelCounts
  selectedLevel: LogLevel | null
  onLevelClick: (level: LogLevel) => void
}

export const LogLevelBadges = ({ counts, selectedLevel, onLevelClick }: LogLevelBadgesProps) => {
  const badges = [
    { level: LogLevelEnum.ERROR, icon: XCircle, count: counts[LogLevelEnum.ERROR], color: 'text-red-600/90 dark:text-red-400/80 bg-red-50/80 dark:bg-red-950/30 border-red-200/60 dark:border-red-900/40', activeColor: 'text-white dark:text-white bg-red-600 dark:bg-red-600 border-red-700 dark:border-red-700' },
    { level: LogLevelEnum.WARNING, icon: AlertTriangle, count: counts[LogLevelEnum.WARNING], color: 'text-amber-600/90 dark:text-amber-400/80 bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40', activeColor: 'text-white dark:text-white bg-amber-600 dark:bg-amber-600 border-amber-700 dark:border-amber-700' },
    { level: LogLevelEnum.INFO, icon: Info, count: counts[LogLevelEnum.INFO], color: 'text-blue-600/90 dark:text-blue-400/80 bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40', activeColor: 'text-white dark:text-white bg-blue-600 dark:bg-blue-600 border-blue-700 dark:border-blue-700' },
    { level: LogLevelEnum.DEBUG, icon: Bug, count: counts[LogLevelEnum.DEBUG], color: 'text-gray-500/90 dark:text-gray-400/80 bg-gray-50/80 dark:bg-gray-950/30 border-gray-200/60 dark:border-gray-900/40', activeColor: 'text-white dark:text-white bg-gray-600 dark:bg-gray-600 border-gray-700 dark:border-gray-700' },
    { level: LogLevelEnum.SUCCESS, icon: CheckCircle, count: counts[LogLevelEnum.SUCCESS], color: 'text-green-600/90 dark:text-green-400/80 bg-green-50/80 dark:bg-green-950/30 border-green-200/60 dark:border-green-900/40', activeColor: 'text-white dark:text-white bg-green-600 dark:bg-green-600 border-green-700 dark:border-green-700' },
    { level: LogLevelEnum.DEFAULT, icon: Circle, count: counts[LogLevelEnum.DEFAULT], color: 'text-gray-400/90 dark:text-gray-500/80 bg-gray-50/80 dark:bg-gray-900/30 border-gray-300/60 dark:border-gray-700/40', activeColor: 'text-white dark:text-white bg-gray-600 dark:bg-gray-600 border-gray-700 dark:border-gray-700' },
  ] as const

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map(({ level, icon: Icon, count, color, activeColor }) => (
        count > 0 && (
          <button
            key={level}
            onClick={() => onLevelClick(level)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shadow-sm transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer ${selectedLevel === level ? activeColor : color}`}
            title={`${selectedLevel === level ? 'Clear filter' : 'Filter by'} ${level} (${count})`}
          >
            <Icon className="w-3 h-3" />
            <span className="text-[9px] font-semibold">{count}</span>
          </button>
        )
      ))}
    </div>
  )
}



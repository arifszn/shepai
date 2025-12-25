import { XCircle, AlertTriangle, Info, Bug, CheckCircle, Circle } from 'lucide-react'
import { LogLevelCounts } from './types'

interface LogLevelBadgesProps {
  counts: LogLevelCounts
}

export const LogLevelBadges = ({ counts }: LogLevelBadgesProps) => {
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

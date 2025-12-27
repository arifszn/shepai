import { Pause } from 'lucide-react'
import type { LogLevel } from '../enums'
import type { LogLevelCounts } from '../types'
import { LogLevelBadges } from './LogLevelBadges'

interface LogViewerFooterProps {
  filteredCount: number
  totalCount: number
  searchQuery: string

  isPaused: boolean
  pausedCount: number

  levelCounts: LogLevelCounts
  selectedLevel: LogLevel | null
  onLevelClick: (level: LogLevel) => void

  isLoading: boolean
  connected: boolean
}

export const LogViewerFooter = ({
  filteredCount,
  totalCount,
  searchQuery,
  isPaused,
  pausedCount,
  levelCounts,
  selectedLevel,
  onLevelClick,
  isLoading,
  connected,
}: LogViewerFooterProps) => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur-md shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.3)]">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 text-[11px] text-muted-foreground">
          {/* Left: Log counts */}
          <div className="flex items-center justify-center lg:justify-start gap-4 flex-1 w-full lg:w-auto order-2 lg:order-1">
            <span className="flex items-center gap-2">
              <span className="font-semibold text-foreground tracking-tight">{filteredCount}</span>
              {filteredCount === 1 ? 'log' : 'logs'}
            </span>
            {searchQuery && (
              <span className="text-[11px]">(filtered from {totalCount} total)</span>
            )}
            {isPaused && pausedCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <Pause className="w-3 h-3" />
                {pausedCount} paused
              </span>
            )}
          </div>

          {/* Center: Log level badges */}
          <div className="flex items-center justify-center order-1 lg:order-2 w-full lg:w-auto">
            <LogLevelBadges
              counts={levelCounts}
              selectedLevel={selectedLevel}
              onLevelClick={onLevelClick}
            />
          </div>

          {/* Right: Connection status */}
          <div className="flex items-center justify-center lg:justify-end gap-2 flex-1 w-full lg:w-auto order-3">
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
  )
}



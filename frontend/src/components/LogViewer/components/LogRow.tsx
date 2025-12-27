import { ChevronDown, ChevronRight } from 'lucide-react'
import type Convert from 'ansi-to-html'
import type { DisplayLogEvent } from '../types'
import type { LogLevel } from '../enums'
import { formatTimestamp } from '../utils/time'
import { tryParseJSON } from '../utils/json'
import { getSeverityColor, getSeverityLevel } from '../utils/severity'
import { LogMessage } from './LogMessage'

interface LogRowProps {
  log: DisplayLogEvent
  index: number
  showTimestamps: boolean
  searchQuery: string
  isDarkMode: boolean
  ansiConverter: Convert

  expanded: boolean
  onToggleExpanded: () => void

  jsonViewerEnabled?: boolean
  jsonViewerGlobalEnabled: boolean
  onToggleJsonViewer: () => void

  focusedLogKey: string | null
  onToggleFocus: () => void
}

export const LogRow = ({
  log,
  index,
  showTimestamps,
  searchQuery,
  isDarkMode,
  ansiConverter,
  expanded,
  onToggleExpanded,
  jsonViewerEnabled,
  jsonViewerGlobalEnabled,
  onToggleJsonViewer,
  focusedLogKey,
  onToggleFocus,
}: LogRowProps) => {
  const isExpanded = expanded
  const hasDetails = log.details.length > 0
  const severity: LogLevel = getSeverityLevel(log.header)
  const hasJson = !!tryParseJSON(log.header)
  const showJsonViewer = jsonViewerEnabled ?? jsonViewerGlobalEnabled

  const isFocused = focusedLogKey === log.key
  const isBlurMode = focusedLogKey !== null
  const isBlurred = isBlurMode && !isFocused

  return (
    <div
      onClick={() => {
        // Don't toggle focus if user is selecting text
        if (window.getSelection()?.toString()) return
        onToggleFocus()
      }}
      className={`
        transition-all duration-300 ease-in-out cursor-pointer
        ${index % 2 === 0 ? 'bg-muted/60 dark:bg-muted/60' : 'bg-transparent'}
        ${isBlurred ? 'opacity-30 blur-[1px] grayscale-[0.5]' : ''}
        ${isFocused ? 'ring-1 ring-primary/40 shadow-lg scale-[1.01] z-10 rounded-sm !bg-background dark:!bg-background my-1 border-y border-border/50 relative' : 'hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:shadow-sm'}
      `}
    >
      <div className={`flex gap-2 sm:gap-4 py-2 sm:py-3 px-2 sm:px-4 ${getSeverityColor(log.header)}`}>
        {showTimestamps && (
          <span
            className="text-gray-500 dark:text-gray-400 flex-shrink-0 pt-0.5 font-medium tracking-wide hidden sm:block"
            style={{ fontSize: '10px' }}
          >
            {formatTimestamp(log.timestamp)}
          </span>
        )}
        {showTimestamps && (
          <span
            className="text-gray-500 dark:text-gray-400 flex-shrink-0 pt-0.5 font-medium tracking-wide sm:hidden"
            style={{ fontSize: '10px' }}
          >
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {hasDetails ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpanded()
                }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleJsonViewer()
                }}
                className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center rounded border border-border/50 bg-background/60 hover:bg-accent hover:border-border transition-all duration-150 active:scale-95 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                title={showJsonViewer ? 'Show raw JSON' : 'Show JSON viewer'}
              >
                {showJsonViewer ? 'JSON' : 'RAW'}
              </button>
            ) : (
              <span className="w-6 flex-shrink-0" />
            )}

            <span className="flex-1 break-words font-mono text-[11px] leading-relaxed">
              <LogMessage
                text={log.header}
                query={searchQuery}
                severity={severity}
                showJsonViewer={showJsonViewer}
                ansiConverter={ansiConverter}
                isDarkMode={isDarkMode}
              />
            </span>
          </div>

          {hasDetails && isExpanded && (
            <div className="mt-3 rounded-md border border-border/40 bg-muted/30 dark:bg-muted/20 shadow-inner p-3">
              <pre className="font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">
                <LogMessage
                  text={log.details.join('\n')}
                  query={searchQuery}
                  severity={severity}
                  showJsonViewer={showJsonViewer}
                  ansiConverter={ansiConverter}
                  isDarkMode={isDarkMode}
                />
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



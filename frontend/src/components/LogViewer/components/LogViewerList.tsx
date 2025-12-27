import type Convert from 'ansi-to-html'
import type { DisplayLogEvent } from '../types'
import { LogRow } from './LogRow'

interface LogViewerListProps {
  logs: DisplayLogEvent[]
  expanded: Record<string, boolean>
  onToggleExpanded: (key: string) => void

  jsonViewerEnabled: Record<string, boolean>
  jsonViewerGlobalEnabled: boolean
  onToggleJsonViewer: (key: string) => void

  focusedLogKey: string | null
  onToggleFocus: (key: string) => void

  showTimestamps: boolean
  searchQuery: string
  isDarkMode: boolean
  ansiConverter: Convert
}

export const LogViewerList = ({
  logs,
  expanded,
  onToggleExpanded,
  jsonViewerEnabled,
  jsonViewerGlobalEnabled,
  onToggleJsonViewer,
  focusedLogKey,
  onToggleFocus,
  showTimestamps,
  searchQuery,
  isDarkMode,
  ansiConverter,
}: LogViewerListProps) => {
  return (
    <div className="divide-y divide-border/20">
      {logs.map((log, index) => (
        <LogRow
          key={log.key}
          log={log}
          index={index}
          showTimestamps={showTimestamps}
          searchQuery={searchQuery}
          isDarkMode={isDarkMode}
          ansiConverter={ansiConverter}
          expanded={!!expanded[log.key]}
          onToggleExpanded={() => onToggleExpanded(log.key)}
          jsonViewerEnabled={jsonViewerEnabled[log.key]}
          jsonViewerGlobalEnabled={jsonViewerGlobalEnabled}
          onToggleJsonViewer={() => onToggleJsonViewer(log.key)}
          focusedLogKey={focusedLogKey}
          onToggleFocus={() => onToggleFocus(log.key)}
        />
      ))}
    </div>
  )
}



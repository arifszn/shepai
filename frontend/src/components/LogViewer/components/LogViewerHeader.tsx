import { ArrowDown, ArrowUp, Braces, Eye, EyeOff, Layers, Minus, Moon, Pause, Play, Plus, Search, Sun, Trash2, X } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'

interface LogViewerHeaderProps {
  sourceName: string
  showTimestamps: boolean
  onToggleTimestamps: () => void

  stackTraceViewEnabled: boolean
  onToggleStackTraceView: () => void

  autoScroll: boolean
  onToggleAutoScroll: () => void

  jsonViewerGlobalEnabled: boolean
  onToggleJsonViewerGlobal: () => void

  onScrollTop: () => void
  onScrollBottom: () => void

  isPaused: boolean
  onTogglePause: () => void

  zoomLevel: number
  onZoomIn: () => void
  onZoomOut: () => void

  canClear: boolean
  onClearAll: () => void

  isDarkMode: boolean
  onToggleDarkMode: () => void

  searchQuery: string
  onSearchQueryChange: (next: string) => void
  onClearSearch: () => void
}

export const LogViewerHeader = ({
  sourceName,
  showTimestamps,
  onToggleTimestamps,
  stackTraceViewEnabled,
  onToggleStackTraceView,
  autoScroll,
  onToggleAutoScroll,
  jsonViewerGlobalEnabled,
  onToggleJsonViewerGlobal,
  onScrollTop,
  onScrollBottom,
  isPaused,
  onTogglePause,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  canClear,
  onClearAll,
  isDarkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchQueryChange,
  onClearSearch,
}: LogViewerHeaderProps) => {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur-md shadow-[0_1px_3px_0_rgb(0_0_0_0.04)] dark:shadow-[0_1px_3px_0_rgb(0_0_0_0.3)]">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
        {/* Top Row: Logo and Buttons */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-4">
          {/* Left: shepai title */}
          <div className="flex items-center justify-between w-full xl:w-auto gap-3">
            <h1 className="text-xl font-bold text-foreground/90 tracking-tight">shepai</h1>
            {sourceName && (
              <>
                <div className="w-px h-5 bg-border/40" />
                <span className="text-sm text-muted-foreground font-medium">{sourceName}</span>
              </>
            )}
          </div>

          {/* Right: Compact buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full xl:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTimestamps}
              className="h-7 px-2.5 text-[11px] whitespace-nowrap"
              title={showTimestamps ? 'Hide timestamps' : 'Show timestamps'}
            >
              {showTimestamps ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  <span className="ml-1.5 hidden sm:inline">Timestamps</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span className="ml-1.5 hidden sm:inline">Timestamps</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleStackTraceView}
              className="h-7 px-2.5 text-[11px] whitespace-nowrap"
              title={stackTraceViewEnabled ? 'Disable grouping (show raw lines)' : 'Enable grouping (combine stack traces)'}
            >
              {stackTraceViewEnabled ? (
                <>
                  <Layers className="w-3 h-3" />
                  <span className="ml-1.5 hidden sm:inline">Traces: Grouped</span>
                </>
              ) : (
                <>
                  <Layers className="w-3 h-3" />
                  <span className="ml-1.5 hidden sm:inline">Traces: Raw</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAutoScroll}
              className="h-7 px-2.5 text-[11px] whitespace-nowrap"
            >
              Auto-scroll: {autoScroll ? 'On' : 'Off'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleJsonViewerGlobal}
              className="h-7 px-2.5 text-[11px] whitespace-nowrap"
              title={jsonViewerGlobalEnabled ? 'Disable JSON viewer' : 'Enable JSON viewer'}
            >
              <Braces className="w-3 h-3" />
              <span className="ml-1.5 hidden sm:inline">JSON: {jsonViewerGlobalEnabled ? 'On' : 'Off'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onScrollTop}
              className="h-7 px-2 text-[11px]"
              title="Scroll to top"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onScrollBottom}
              className="h-7 px-2 text-[11px]"
              title="Scroll to bottom"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePause}
              className={`h-7 px-2.5 text-[11px] whitespace-nowrap ${isPaused ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 hover:text-white dark:hover:text-black border-black dark:border-white' : ''}`}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </Button>

            {/* Zoom Controls */}
            <div className="flex items-center rounded-md border border-input bg-background">
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomOut}
                disabled={zoomLevel <= 0.5}
                className="h-7 w-7 rounded-none rounded-l-md p-0 hover:bg-accent"
                title="Zoom out"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <div className="w-px h-4 bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomIn}
                disabled={zoomLevel >= 1.5}
                className="h-7 w-7 rounded-none rounded-r-md p-0 hover:bg-accent"
                title="Zoom in"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={!canClear}
              className="h-7 px-2.5 text-[11px] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3 h-3" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDarkMode}
              className="h-7 px-2 text-[11px] bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 hover:text-white dark:hover:text-black border-black dark:border-white"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 pr-10 h-9 text-sm shadow-[0_1px_2px_0_rgb(0_0_0_0.05)] dark:shadow-[0_1px_2px_0_rgb(0_0_0_0.2)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}



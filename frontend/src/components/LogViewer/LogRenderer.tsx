import React, { useMemo } from 'react'
import Convert from 'ansi-to-html'
import JsonView from '@uiw/react-json-view'
import { tryParseJSON } from './utils'
import { SeverityLevel } from './types'

interface LogRendererProps {
  text: string
  query: string
  severity?: SeverityLevel
  showJsonViewer?: boolean
  isDarkMode: boolean
}

export const LogRenderer = ({ text, query, severity, showJsonViewer, isDarkMode }: LogRendererProps) => {
  // Create ANSI converter that adapts to theme
  const ansiConverter = useMemo(() => {
    return new Convert({
      fg: isDarkMode ? '#E5E7EB' : '#1F2937', // light gray for dark mode, dark gray for light mode
      bg: isDarkMode ? '#0F172A' : '#FFFFFF', // dark bg for dark mode, white for light mode
      newline: false,
      escapeXML: true,
      stream: false
    })
  }, [isDarkMode])

  const renderLogMessage = (text: string, query: string, severity?: SeverityLevel, showJsonViewer?: boolean): React.ReactNode => {
    // Try to parse as JSON first
    const jsonData = tryParseJSON(text)

    if (jsonData && showJsonViewer) {
      // Get severity-based key color
      const getSeverityKeyColor = () => {
        if (!severity || severity === 'default') {
          return isDarkMode ? '#93C5FD' : '#1D4ED8'
        }

        const colorMap = {
          error: isDarkMode ? '#F87171' : '#DC2626',
          warning: isDarkMode ? '#FBBF24' : '#D97706',
          info: isDarkMode ? '#60A5FA' : '#2563EB',
          debug: isDarkMode ? '#9CA3AF' : '#6B7280',
          success: isDarkMode ? '#34D399' : '#059669',
          default: isDarkMode ? '#93C5FD' : '#1D4ED8',
        }

        return colorMap[severity]
      }

      // Render as JSON viewer with theme-aware colors
      return (
        <div className="my-1">
          <JsonView
            value={jsonData}
            collapsed={false}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            style={{
              backgroundColor: 'transparent',
              fontSize: '11px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              ...(isDarkMode ? {
                '--w-rjv-color': '#E5E7EB',
                '--w-rjv-key-string': getSeverityKeyColor(),
                '--w-rjv-background-color': 'transparent',
                '--w-rjv-line-color': '#374151',
                '--w-rjv-arrow-color': 'transparent',
                '--w-rjv-edit-color': '#60A5FA',
                '--w-rjv-info-color': '#6B7280',
                '--w-rjv-update-color': '#34D399',
                '--w-rjv-copied-color': '#10B981',
                '--w-rjv-copied-success-color': '#059669',
                '--w-rjv-curlybraces-color': '#9CA3AF',
                '--w-rjv-colon-color': '#6B7280',
                '--w-rjv-brackets-color': '#9CA3AF',
                '--w-rjv-quotes-color': '#6B7280',
                '--w-rjv-quotes-string-color': '#E5E7EB',
                '--w-rjv-type-string-color': '#E5E7EB',
                '--w-rjv-type-int-color': '#93C5FD',
                '--w-rjv-type-float-color': '#93C5FD',
                '--w-rjv-type-bigint-color': '#93C5FD',
                '--w-rjv-type-boolean-color': '#C4B5FD',
                '--w-rjv-type-date-color': '#A78BFA',
                '--w-rjv-type-url-color': '#60A5FA',
                '--w-rjv-type-null-color': '#9CA3AF',
                '--w-rjv-type-nan-color': '#9CA3AF',
                '--w-rjv-type-undefined-color': '#6B7280',
              } : {
                '--w-rjv-color': '#1F2937',
                '--w-rjv-key-string': getSeverityKeyColor(),
                '--w-rjv-background-color': 'transparent',
                '--w-rjv-line-color': '#E5E7EB',
                '--w-rjv-arrow-color': 'transparent',
                '--w-rjv-edit-color': '#2563EB',
                '--w-rjv-info-color': '#9CA3AF',
                '--w-rjv-update-color': '#059669',
                '--w-rjv-copied-color': '#10B981',
                '--w-rjv-copied-success-color': '#047857',
                '--w-rjv-curlybraces-color': '#6B7280',
                '--w-rjv-colon-color': '#9CA3AF',
                '--w-rjv-brackets-color': '#6B7280',
                '--w-rjv-quotes-color': '#9CA3AF',
                '--w-rjv-quotes-string-color': '#1F2937',
                '--w-rjv-type-string-color': '#1F2937',
                '--w-rjv-type-int-color': '#2563EB',
                '--w-rjv-type-float-color': '#2563EB',
                '--w-rjv-type-bigint-color': '#2563EB',
                '--w-rjv-type-boolean-color': '#7C3AED',
                '--w-rjv-type-date-color': '#7C3AED',
                '--w-rjv-type-url-color': '#2563EB',
                '--w-rjv-type-null-color': '#6B7280',
                '--w-rjv-type-nan-color': '#6B7280',
                '--w-rjv-type-undefined-color': '#9CA3AF',
              }),
            } as any}
          />
        </div>
      )
    }

    // Convert ANSI codes to HTML
    const html = ansiConverter.toHtml(text)

    // If there's a search query, we need to highlight matches
    // But we'll do it after ANSI conversion to preserve colors
    if (!query) {
      return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
    }

    // For search highlighting with ANSI, we'll highlight in the HTML
    const lowerText = text.replace(/\x1b\[[0-9;]*m/g, '').toLowerCase()
    const lowerQuery = query.toLowerCase()

    if (!lowerText.includes(lowerQuery)) {
      return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html }} />
    }

    // Simple approach: wrap matches in a highlight span
    // This is a simplified version - full ANSI-aware highlighting is complex
    const highlightedHtml = html.replace(
      new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
      '<span class="bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 font-semibold">$1</span>'
    )

    return <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
  }

  return <>{renderLogMessage(text, query, severity, showJsonViewer)}</>
}

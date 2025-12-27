import Convert from 'ansi-to-html'

export const createAnsiConverter = (isDarkMode: boolean) => {
  return new Convert({
    fg: isDarkMode ? '#E5E7EB' : '#1F2937', // light gray for dark mode, dark gray for light mode
    bg: isDarkMode ? '#0F172A' : '#FFFFFF', // dark bg for dark mode, white for light mode
    newline: false,
    escapeXML: true,
    stream: false,
  })
}



export const tryParseJSON = (text: string): any | null => {
  try {
    // Trim whitespace
    const trimmed = text.trim()

    // Must start with { or [ to be JSON
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return null
    }

    const parsed = JSON.parse(trimmed)

    // Only return if it's an object or array (not primitives)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}



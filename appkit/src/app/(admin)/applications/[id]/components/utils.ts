export const isValidRedirectUri = (uri: string) => {
  if (!uri) return false
  const trimmed = uri.trim()

  // Accept standard web callback URLs.
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return true
  } catch {
    // Continue to custom scheme validation.
  }

  // Accept mobile deep-link callbacks like "myapp://auth/callback".
  return /^[a-z][a-z0-9+.-]*:\/\/.+/i.test(trimmed)
}

export const isValidPostAuthRedirect = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (trimmed.startsWith('/')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const maskSecret = (secret: string) => {
  if (!secret) return ''
  if (secret.length <= 4) return '•'.repeat(secret.length)

  const visibleTotal = Math.max(2, Math.floor(secret.length * 0.2))
  const visibleStart = Math.ceil(visibleTotal / 2)
  const visibleEnd = Math.floor(visibleTotal / 2)
  const maskedCount = Math.max(1, secret.length - visibleStart - visibleEnd)

  return `${secret.slice(0, visibleStart)}${'•'.repeat(maskedCount)}${secret.slice(secret.length - visibleEnd)}`
}

export const maskSecretCommon = (last4: string | null | undefined) => {
  if (!last4) return '••••••••••••'
  return `acs_••••••••${last4}`
}


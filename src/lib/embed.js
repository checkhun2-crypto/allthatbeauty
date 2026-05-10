export function youtubeIdFromUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '')
    const v = u.searchParams.get('v')
    if (v) return v
  } catch {
    return null
  }
  return null
}

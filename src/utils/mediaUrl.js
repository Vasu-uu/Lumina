export const FILE_SERVER_PORT = 45678
export const FILE_SERVER_BASE = `http://127.0.0.1:${FILE_SERVER_PORT}`

export function toMediaUrl(filePath) {
  if (!filePath) return ''
  const normalized = filePath.replace(/\\/g, '/')
  return `${FILE_SERVER_BASE}/?p=${encodeURIComponent(normalized)}`
}

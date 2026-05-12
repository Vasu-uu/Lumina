const fs = require('fs')
const path = require('path')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg', '.heic', '.avif'])
const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg', '.3gp', '.ts', '.m2ts'])

function getMediaType(ext) {
  const e = ext.toLowerCase()
  if (IMAGE_EXTS.has(e)) return 'image'
  if (VIDEO_EXTS.has(e)) return 'video'
  return null
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function scanFolder(rootPath, onProgress, onComplete, onError) {
  const files = []
  let scanned = 0
  let totalSize = 0

  function walkDir(dirPath) {
    let entries
    try { entries = fs.readdirSync(dirPath, { withFileTypes: true }) }
    catch (e) { return }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '$RECYCLE.BIN') continue
        walkDir(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        const type = getMediaType(ext)
        if (!type) continue

        let stat
        try { stat = fs.statSync(fullPath) }
        catch (e) { continue }

        files.push({
          id: fullPath, path: fullPath, name: entry.name,
          nameNoExt: path.basename(entry.name, ext), ext, type,
          size: stat.size, sizeFormatted: formatBytes(stat.size),
          modified: stat.mtime.toISOString(), modifiedMs: stat.mtimeMs,
          created: stat.birthtime.toISOString(), directory: dirPath,
          thumbnail: null, duration: null, favorite: false,
        })
        totalSize += stat.size
        scanned++

        if (scanned % 50 === 0) {
          onProgress({ scanned, totalSize, totalSizeFormatted: formatBytes(totalSize), currentDir: dirPath, lastFile: entry.name })
        }
      }
    }
  }

  try {
    walkDir(rootPath)
    onProgress({ scanned, totalSize, totalSizeFormatted: formatBytes(totalSize), done: true })
    onComplete(files)
  } catch (e) { onError(e) }
}

module.exports = { scanFolder }

const path = require('path')
const fs = require('fs')
const { app } = require('electron')

let ffmpeg
let ffmpegPath

try {
  ffmpegPath = require('ffmpeg-static')
  ffmpeg = require('fluent-ffmpeg')
  ffmpeg.setFfmpegPath(ffmpegPath)
} catch (e) {
  console.warn('[thumbnails] ffmpeg-static not available:', e.message)
}

const THUMB_DIR = path.join(app.getPath('userData'), 'thumbnails')

if (!fs.existsSync(THUMB_DIR)) {
  fs.mkdirSync(THUMB_DIR, { recursive: true })
}

function hashPath(filePath) {
  let hash = 0
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

async function generateThumbnail(filePath) {
  if (!ffmpeg) return null

  const key = hashPath(filePath)
  const thumbPath = path.join(THUMB_DIR, `${key}.jpg`)

  if (fs.existsSync(thumbPath)) return thumbPath

  return new Promise((resolve) => {
    try {
      ffmpeg(filePath)
        .on('end', () => resolve(thumbPath))
        .on('error', () => resolve(null))
        .screenshots({
          timestamps: ['10%'], filename: `${key}.jpg`,
          folder: THUMB_DIR, size: '640x?',
        })
    } catch (e) { resolve(null) }
  })
}

module.exports = { generateThumbnail }

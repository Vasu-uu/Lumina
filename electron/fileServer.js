const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 45678

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
  '.tiff': 'image/tiff', '.tif': 'image/tiff', '.avif': 'image/avif',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.m4v': 'video/mp4',
  '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime', '.wmv': 'video/x-ms-wmv', '.flv': 'video/x-flv',
  '.mpg': 'video/mpeg', '.mpeg': 'video/mpeg', '.3gp': 'video/3gpp',
  '.ts': 'video/mp2t',
}

const ALLOWED = new Set(Object.keys(MIME))

function startFileServer() {
  const server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Range')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length')

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

    const rawUrl = req.url
    const qIdx = rawUrl.indexOf('?')
    const query = qIdx >= 0 ? rawUrl.slice(qIdx + 1) : ''
    const params = new URLSearchParams(query)
    const filePath = decodeURIComponent(params.get('p') || '')

    if (!filePath) { res.writeHead(400); res.end('Missing path param'); return }

    const ext = path.extname(filePath).toLowerCase()
    if (!ALLOWED.has(ext)) { res.writeHead(403); res.end('Forbidden'); return }

    let stat
    try { stat = fs.statSync(filePath) }
    catch (e) { res.writeHead(404); res.end('Not found'); return }

    const fileSize = stat.size
    const mimeType = MIME[ext] || 'application/octet-stream'
    const rangeHeader = req.headers['range']

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (!match) { res.writeHead(416); res.end(); return }
      const start = parseInt(match[1], 10)
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1

      if (start >= fileSize || end >= fileSize || start > end) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + fileSize })
        res.end()
        return
      }

      const chunkSize = end - start + 1
      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
        'Accept-Ranges': 'bytes', 'Content-Length': chunkSize, 'Content-Type': mimeType,
      })
      fs.createReadStream(filePath, { start, end }).pipe(res)
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize, 'Accept-Ranges': 'bytes', 'Content-Type': mimeType,
      })
      if (req.method === 'HEAD') { res.end() }
      else { fs.createReadStream(filePath).pipe(res) }
    }
  })

  server.on('error', function (e) { console.error('[Lumina] File server error:', e.message) })
  server.listen(PORT, '127.0.0.1', function () {
    console.log('[Lumina] Media file server listening on http://127.0.0.1:' + PORT)
  })

  return server
}

module.exports = { startFileServer, PORT }

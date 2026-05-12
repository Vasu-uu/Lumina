import { useState, useEffect, useRef } from 'react'
import { toMediaUrl } from './mediaUrl'

const cache = new Map()
const MAX_CACHE = 500

function addToCache(key, value) {
  if (cache.size >= MAX_CACHE) {
    cache.delete(cache.keys().next().value)
  }
  cache.set(key, value)
}

export function useVideoThumbnail(filePath, enabled = true) {
  const [thumb, setThumb] = useState(() => cache.get(filePath) || null)
  const [error, setError] = useState(false)
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (!filePath || !enabled || thumb || error) return

    const cached = cache.get(filePath)
    if (cached) { setThumb(cached); return }

    let cancelled = false
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.muted = true
    video.preload = 'metadata'
    video.crossOrigin = 'anonymous'
    video.src = toMediaUrl(filePath)

    const cleanup = () => {
      cancelled = true
      video.pause()
      video.removeAttribute('src')
      video.load()
    }

    const onMeta = () => {
      if (cancelled) return
      video.currentTime = Math.min(video.duration * 0.1, 5)
    }

    const onSeeked = () => {
      if (cancelled) return
      try {
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 360
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        addToCache(filePath, dataUrl)
        setThumb(dataUrl)
      } catch (e) {
        setError(true)
      } finally {
        cleanup()
      }
    }

    const onError = () => {
      if (!cancelled) setError(true)
      cleanup()
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)

    const timer = setTimeout(() => {
      if (!cancelled) setError(true)
      cleanup()
    }, 8000)

    cleanupRef.current = () => {
      clearTimeout(timer)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      cleanup()
    }

    return cleanupRef.current
  }, [filePath, enabled])

  return { thumb, error }
}

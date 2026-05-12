import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings, ExternalLink,
} from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'
import { toMediaUrl } from '../../utils/mediaUrl'

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayer() {
  const { activeMedia, closeViewer, nextMedia, prevMedia } = useMediaStore()
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const hideTimer = useRef(null)
  const rafRef = useRef(null)

  const [playing,       setPlaying]       = useState(false)
  const [volume,        setVolume]         = useState(1)
  const [muted,         setMuted]          = useState(false)
  const [currentTime,   setCurrentTime]    = useState(0)
  const [duration,      setDuration]       = useState(0)
  const [showControls,  setShowControls]   = useState(true)
  const [playbackRate,  setPlaybackRate]   = useState(1)
  const [isFullscreen,  setIsFullscreen]   = useState(false)
  const [showSettings,  setShowSettings]   = useState(false)
  const [videoError,    setVideoError]     = useState(false)

  const src = activeMedia ? toMediaUrl(activeMedia.path) : ''

  useEffect(() => {
    setVideoError(false)
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
    if (videoRef.current && src) {
      videoRef.current.load()
      videoRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
    }, [src])

  const resetHide = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  useEffect(() => {
    resetHide()
    return () => clearTimeout(hideTimer.current)
  }, [playing, resetHide])

  useEffect(() => {
    const handler = (e) => {
      switch (e.key) {
        case 'Escape':      closeViewer(); break
        case ' ':           e.preventDefault(); togglePlay(); break
        case 'ArrowRight':  if (e.shiftKey) nextMedia(); else skipBy(10); break
        case 'ArrowLeft':   if (e.shiftKey) prevMedia(); else skipBy(-10); break
        case 'ArrowUp':     changeVol(0.1); break
        case 'ArrowDown':   changeVol(-0.1); break
        case 'm': case 'M': setMuted(v => !v); break
        case 'f': case 'F': toggleFullscreen(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeViewer, nextMedia, prevMedia, playing])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause(); setPlaying(false) }
    else         { videoRef.current.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const skipBy = (delta) => {
    if (videoRef.current) videoRef.current.currentTime += delta
  }

  const changeVol = (delta) => {
    const next = Math.max(0, Math.min(1, volume + delta))
    setVolume(next)
    if (videoRef.current) videoRef.current.volume = next
    if (next === 0) setMuted(true)
    else setMuted(false)
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleSeek = (e) => {
    if (!duration || !videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    videoRef.current.currentTime = pct * duration
  }

  const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2, 4]
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      onMouseMove={resetHide}
      onClick={(e) => { if (e.target === e.currentTarget) closeViewer() }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />

      {/* Video container */}
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{    scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-black"
        style={{
          maxHeight:  '85vh',
          aspectRatio:'16/9',
          boxShadow:  '0 40px 100px rgba(0,0,0,0.85)',
        }}
      >
        {videoError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-900">
            <p className="text-slate-400 font-medium">Cannot play this video</p>
            <p className="text-slate-600 text-sm text-center max-w-xs">
              The format may not be supported. Try opening it in the system player.
            </p>
            <button
              onClick={() => window.electron?.shell?.openFile(activeMedia?.path)}
              className="mt-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-300"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              Open in System Player
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            key={src}
            src={src}
            className="w-full h-full object-contain"
            style={{ cursor: showControls ? 'default' : 'none', background: '#000' }}
            onTimeUpdate={() => {
              if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(() => {
                  rafRef.current = null
                  setCurrentTime(videoRef.current?.currentTime || 0)
                })
              }
            }}
            onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration || 0)
              if (videoRef.current) {
                videoRef.current.volume        = muted ? 0 : volume
                videoRef.current.playbackRate  = playbackRate
              }
            }}
            onEnded={() => setPlaying(false)}
            onError={() => setVideoError(true)}
            onClick={togglePlay}
            playsInline
          />
        )}


        <AnimatePresence>
          {showControls && !videoError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 bottom-0"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)', padding: '56px 20px 18px' }}
            >
              {/* Timeline */}
              <div
                className="relative h-1 rounded-full mb-4 cursor-pointer group/bar"
                style={{ background: 'rgba(255,255,255,0.18)' }}
                onClick={handleSeek}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)', boxShadow: '0 0 8px rgba(99,102,241,0.7)' }}
                />
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CtrlBtn icon={ChevronLeft}  onClick={prevMedia}        title="Previous (Shift+←)" />
                  <CtrlBtn icon={SkipBack}     onClick={() => skipBy(-10)} title="-10s" />

                  {/* Play / Pause */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={togglePlay}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.45)' }}
                  >
                    {playing
                      ? <Pause size={18} className="fill-white" />
                      : <Play  size={18} className="fill-white ml-0.5" />}
                  </motion.button>

                  <CtrlBtn icon={SkipForward}  onClick={() => skipBy(10)} title="+10s" />
                  <CtrlBtn icon={ChevronRight} onClick={nextMedia}        title="Next (Shift+→)" />

                  {/* Volume */}
                  <div className="flex items-center gap-2 ml-1">
                    <CtrlBtn
                      icon={muted || volume === 0 ? VolumeX : Volume2}
                      onClick={() => setMuted(v => !v)}
                      title="Mute (M)"
                    />
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={muted ? 0 : volume}
                      onChange={(e) => {
                        const v = +e.target.value
                        setVolume(v)
                        setMuted(v === 0)
                        if (videoRef.current) videoRef.current.volume = v
                      }}
                      className="w-20"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-xs text-slate-400 font-mono tabular-nums ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed */}
                  <div className="relative">
                    <CtrlBtn icon={Settings} onClick={() => setShowSettings(v => !v)} title="Playback speed" label={`${playbackRate}×`} />
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute bottom-10 right-0 rounded-xl overflow-hidden"
                          style={{ background: 'rgba(12,12,22,0.97)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', minWidth: 120 }}
                        >
                          <div className="px-3 py-2 text-[11px] text-slate-500 border-b border-white/5 font-semibold uppercase tracking-wider">Speed</div>
                          {RATES.map(r => (
                            <button
                              key={r}
                              onClick={() => {
                                setPlaybackRate(r)
                                if (videoRef.current) videoRef.current.playbackRate = r
                                setShowSettings(false)
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                              style={{ color: r === playbackRate ? '#818cf8' : '#94a3b8' }}
                            >
                              <span>{r}×</span>
                              {r === playbackRate && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <CtrlBtn icon={ExternalLink} onClick={() => window.electron?.shell?.openFile(activeMedia?.path)} title="Open in system player" />
                  <CtrlBtn icon={isFullscreen ? Minimize : Maximize} onClick={toggleFullscreen} title="Fullscreen (F)" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>


      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute top-5 inset-x-0 px-6 flex items-center justify-between pointer-events-none"
          >
            <div className="pointer-events-auto">
              <p className="text-white font-semibold text-sm truncate max-w-lg">{activeMedia?.name}</p>
              <p className="text-slate-500 text-xs">{activeMedia?.sizeFormatted}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeViewer}
              className="pointer-events-auto w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <X size={15} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CtrlBtn({ icon: Icon, onClick, title, label }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      title={title}
      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
    >
      <Icon size={15} />
      {label && <span className="text-xs font-mono text-slate-400">{label}</span>}
    </motion.button>
  )
}

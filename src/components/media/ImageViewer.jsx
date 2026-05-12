import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, RotateCcw, Info, ExternalLink,
} from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'
import { toMediaUrl } from '../../utils/mediaUrl'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
    })
  } catch { return '—' }
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${s[i]}`
}

export default function ImageViewer() {
  const { activeMedia, closeViewer, nextMedia, prevMedia } = useMediaStore()
  const [zoom,         setZoom]         = useState(1)
  const [pan,          setPan]          = useState({ x: 0, y: 0 })
  const [showInfo,     setShowInfo]     = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [imgError,     setImgError]     = useState(false)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const hideTimer = useRef(null)
  const lastResetRef = useRef(0)

  const src = activeMedia ? toMediaUrl(activeMedia.path) : ''

  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setImgError(false)
  }, [activeMedia?.path])

  const resetHide = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 4000)
  }, [])

  useEffect(() => {
    resetHide()
    return () => clearTimeout(hideTimer.current)
  }, [resetHide])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') closeViewer()
      if (e.key === 'ArrowRight') { resetZoom(); nextMedia() }
      if (e.key === 'ArrowLeft') { resetZoom(); prevMedia() }
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z * 1.25, 8))
      if (e.key === '-') setZoom(z => Math.max(z / 1.25, 0.25))
      if (e.key === '0') resetZoom()
      if (e.key === 'i' || e.key === 'I') setShowInfo(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeViewer, nextMedia, prevMedia])

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleWheel = (e) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.88 : 1.14
    setZoom(z => Math.max(0.25, Math.min(8, z * factor)))
  }

  const onMouseDown = (e) => {
    if (zoom <= 1) return
    isDragging.current  = true
    lastPos.current     = { x: e.clientX, y: e.clientY }
  }
  const onMouseMove = (e) => {
    if (!isDragging.current) return
    setPan(p => ({
      x: p.x + (e.clientX - lastPos.current.x),
      y: p.y + (e.clientY - lastPos.current.y),
    }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const onMouseUp = () => { isDragging.current = false }

  const goNext = () => { resetZoom(); nextMedia() }
  const goPrev = () => { resetZoom(); prevMedia() }

  const throttledResetHide = useCallback(() => {
    const now = Date.now()
    if (now - lastResetRef.current > 200) {
      lastResetRef.current = now
      resetHide()
    }
  }, [resetHide])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      onMouseMove={(e) => { onMouseMove(e); throttledResetHide() }}
      onMouseUp={onMouseUp}
      onWheel={handleWheel}
      onClick={(e) => { if (e.target === e.currentTarget) closeViewer() }}
    >
      <motion.div
        key={activeMedia?.path}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.22 }}
        style={{
          transform:       `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center',
          cursor:          zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
          transition:      isDragging.current ? 'none' : 'transform 0.08s ease',
          maxWidth:        '90vw',
          maxHeight:       '90vh',
          userSelect:      'none',
        }}
        onMouseDown={onMouseDown}
      >
        {imgError ? (
          <div className="w-64 h-48 flex flex-col items-center justify-center gap-2 rounded-2xl"
            style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-slate-500 text-sm">Cannot display image</p>
          </div>
        ) : (
          <img
            src={src}
            alt={activeMedia?.name}
            draggable={false}
            onError={() => setImgError(true)}
            style={{
              maxWidth:     '90vw',
              maxHeight:    '90vh',
              objectFit:    'contain',
              borderRadius: zoom === 1 ? '14px' : '0',
              boxShadow:    '0 32px 96px rgba(0,0,0,0.95)',
              display:      'block',
              pointerEvents:'none',
            }}
          />
        )}
      </motion.div>

      <div className="absolute inset-0 -z-10" onClick={closeViewer} />
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-5 pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
          >
            <div className="pointer-events-auto">
              <p className="text-white font-semibold text-sm truncate max-w-sm">{activeMedia?.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatDate(activeMedia?.modified)} · {formatBytes(activeMedia?.size)}</p>
            </div>
            <div className="pointer-events-auto flex items-center gap-1.5">
              <ImgBtn icon={Info}         onClick={() => setShowInfo(v => !v)} active={showInfo} title="Info (I)" />
              <ImgBtn icon={ExternalLink} onClick={() => window.electron?.shell?.showInExplorer(activeMedia?.path)} title="Show in Explorer" />
              <ImgBtn icon={X}            onClick={closeViewer}                title="Close (Esc)" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl"
            style={{
              background:     'rgba(8, 8, 18, 0.92)',
              border:         '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow:      '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            <ImgBtn icon={ChevronLeft}  onClick={goPrev}                                   title="Previous (←)" />
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <ImgBtn icon={ZoomOut}      onClick={() => setZoom(z => Math.max(z/1.25, 0.25))} title="Zoom out (-)" />
            <span className="text-xs text-slate-400 font-mono w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <ImgBtn icon={ZoomIn}       onClick={() => setZoom(z => Math.min(z*1.25, 8))}    title="Zoom in (+)" />
            <ImgBtn icon={RotateCcw}    onClick={resetZoom}                                title="Reset (0)" />
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <ImgBtn icon={ChevronRight} onClick={goNext}                                   title="Next (→)" />
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showControls && (
          <>
            <NavArrow side="left"  onClick={goPrev} />
            <NavArrow side="right" onClick={goNext} />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ x: 280, opacity: 0 }}
            animate={{ x: 0,   opacity: 1 }}
            exit={{    x: 280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="absolute right-0 inset-y-0 w-68 overflow-y-auto"
            style={{
              background:     'rgba(8,8,18,0.96)',
              borderLeft:     '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
              width:          '17rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pt-16 space-y-5">
              <h3 className="text-sm font-semibold text-white">File Info</h3>
              <InfoRow label="Name"     value={activeMedia?.name} />
              <InfoRow label="Type"     value={activeMedia?.ext?.toUpperCase()} />
              <InfoRow label="Size"     value={formatBytes(activeMedia?.size)} />
              <InfoRow label="Modified" value={formatDate(activeMedia?.modified)} />
              <InfoRow label="Location" value={activeMedia?.directory} mono />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ImgBtn({ icon: Icon, onClick, title, active }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
      style={{ color: active ? '#818cf8' : '#94a3b8', background: active ? 'rgba(99,102,241,0.16)' : 'transparent' }}
    >
      <Icon size={15} />
    </motion.button>
  )
}

function NavArrow({ side, onClick }) {
  const isLeft = side === 'left'
  return (
    <motion.button
      initial={{ opacity: 0, x: isLeft ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{    opacity: 0, x: isLeft ? -16 : 16 }}
      whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.1)' }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`absolute ${isLeft ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2
        w-11 h-11 flex items-center justify-center rounded-full transition-all`}
      style={{
        background:     'rgba(0,0,0,0.55)',
        border:         '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(10px)',
        color:          '#fff',
      }}
    >
      {isLeft ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </motion.button>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 mb-1 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-sm text-slate-200 break-all leading-snug ${mono ? 'font-mono text-xs text-slate-400' : ''}`}>
        {value || '—'}
      </p>
    </div>
  )
}

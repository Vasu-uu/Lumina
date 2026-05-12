import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, Trash2, ExternalLink, FileImage, Film } from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'
import { toMediaUrl } from '../../utils/mediaUrl'
import { useVideoThumbnail } from '../../utils/useVideoThumbnail'
import toast from 'react-hot-toast'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '\u2014' }
}

function hashId(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export default function MediaCard({ file, index, onDelete }) {
  const {
    setActiveMedia, getFilteredFiles,
    toggleFavorite, favorites,
    selectedIds, toggleSelect, addRecent,
  } = useMediaStore()

  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const videoRef = useRef(null)

  const isSelected = selectedIds.has(file.id)
  const isFavorited = favorites.has(file.id)
  const isVideo = file.type === 'video'
  const isImage = file.type === 'image'
  const { thumb: videoThumb } = useVideoThumbnail(file.path, isVideo)

  const mediaUrl = toMediaUrl(file.path)
  const thumbUrl = isImage ? mediaUrl : videoThumb

  const cardHeight = useMemo(() => {
    if (isVideo) return 210
    return 170 + (hashId(file.id) % 4) * 35
  }, [file.id, isVideo])

  const handleOpen = () => {
    const files = getFilteredFiles()
    const idx = files.findIndex((f) => f.id === file.id)
    setActiveMedia(file, idx)
    addRecent(file)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    const result = await window.electron?.trash?.delete([file.path])
    if (result?.success) {
      onDelete(file)
      toast.success(`"${file.name}" moved to Recycle Bin`, { icon: '\uD83D\uDDD1\uFE0F' })
    } else {
      toast.error('Failed to delete \u2014 check permissions')
    }
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    toggleFavorite(file.id)
  }

  const handleShowInExplorer = (e) => {
    e.stopPropagation()
    window.electron?.shell?.showInExplorer(file.path)
  }

  useEffect(() => {
    if (!isVideo || !videoRef.current) return
    if (isHovered) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [isHovered, isVideo])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{    opacity: 0, scale: 0.9         }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.015, 0.25), ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="relative group rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        background:  'var(--bg-card)',
        border:      `1px solid ${isSelected ? 'rgba(99,102,241,0.55)' : 'var(--border)'}`,
        boxShadow:    isSelected
          ? '0 0 0 2px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.45)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        height:      cardHeight,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
    >
      <div className="absolute inset-0 bg-black">
        {thumbUrl && !imgError ? (
          <>
            <img
              src={thumbUrl}
              alt={file.name}
              className="w-full h-full object-cover"
              style={{
                transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
              }}
              onError={() => setImgError(true)}
              loading="lazy"
            />

            {isVideo && (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
                muted
                loop
                playsInline
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'var(--bg-elevated)' }}>
            {isVideo
              ? <Film size={28} className="text-slate-600" />
              : <FileImage size={28} className="text-slate-600" />
            }
            {isVideo && !videoThumb && (
              <span className="text-[10px] text-slate-600 animate-pulse">Generating preview&hellip;</span>
            )}
          </div>
        )}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.88) 100%)',
          opacity: isHovered ? 1 : 0.65,
          transition: 'opacity 0.25s ease',
        }}
      />

      <motion.div
        className="absolute top-2.5 left-2.5 z-20"
        animate={{ opacity: isHovered || isSelected ? 1 : 0, scale: isHovered || isSelected ? 1 : 0.75 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => { e.stopPropagation(); toggleSelect(file.id) }}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{
            background: isSelected ? '#6366f1' : 'rgba(0,0,0,0.65)',
            border: `1.5px solid ${isSelected ? '#818cf8' : 'rgba(255,255,255,0.35)'}`,
            backdropFilter: 'blur(8px)',
            transition: 'background 0.15s, border 0.15s',
          }}
        >
          {isSelected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </motion.div>

      {isVideo && !isFavorited && (
        <div
          className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#c4b5fd',
          }}
        >
          <Play size={8} className="fill-violet-400 text-violet-400" />
          VIDEO
        </div>
      )}

      {isFavorited && (
        <div className="absolute top-2.5 right-2.5 z-30">
          <Heart size={14} className="text-pink-400 fill-pink-400 drop-shadow" />
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-3 z-10">
        <p className="text-white text-xs font-semibold truncate leading-tight mb-0.5">
          {file.nameNoExt || file.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">{formatBytes(file.size)}</span>
          <span className="text-[11px] text-slate-500">{formatDate(file.modified)}</span>
        </div>
      </div>

      <motion.div
        className="absolute z-20 flex flex-col gap-1.5"
        style={{ top: isVideo ? '2.5rem' : '2.5rem', right: '0.625rem' }}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 8 }}
        transition={{ duration: 0.18 }}
      >
        <QuickBtn
          icon={Heart}
          onClick={handleFavorite}
          active={isFavorited}
          title={isFavorited ? 'Unfavorite' : 'Favorite'}
          activeClass="bg-pink-500/20 text-pink-400"
        />
        <QuickBtn
          icon={ExternalLink}
          onClick={handleShowInExplorer}
          title="Show in Explorer"
        />
        <QuickBtn
          icon={Trash2}
          onClick={handleDelete}
          title="Move to Recycle Bin"
          hoverClass="hover:bg-red-500/25 hover:text-red-400"
        />
      </motion.div>
    </motion.div>
  )
}

function QuickBtn({ icon: Icon, onClick, title, active, activeClass, hoverClass }) {
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all
        ${active ? activeClass : `bg-black/55 text-slate-300 hover:bg-white/10 ${hoverClass || ''}`}`}
      style={{ backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.09)' }}
    >
      <Icon size={12} className={active ? 'fill-current' : ''} />
    </motion.button>
  )
}

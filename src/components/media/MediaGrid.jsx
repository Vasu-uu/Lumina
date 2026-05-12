import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VirtuosoGrid } from 'react-virtuoso'
import { FileImage } from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'
import MediaCard from './MediaCard'
import { toMediaUrl } from '../../utils/mediaUrl'
import toast from 'react-hot-toast'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}

function SkeletonCard({ height = 200 }) {
  return (
    <div className="rounded-2xl skeleton overflow-hidden" style={{ height }}>
      <div className="w-full h-full" style={{ background: 'var(--bg-card)' }} />
    </div>
  )
}

function ListRow({ file }) {
  const { setActiveMedia, getFilteredFiles, addRecent } = useMediaStore()
  const [imgErr, setImgErr] = useState(false)

  const handleOpen = () => {
    const files = getFilteredFiles()
    const idx = files.findIndex((f) => f.id === file.id)
    setActiveMedia(file, idx)
    addRecent(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleOpen}
      className="flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer group"
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: 'var(--bg-elevated)' }}>
        {!imgErr ? (
          <img
            src={toMediaUrl(file.path)}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <FileImage size={16} className="text-slate-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
        <p className="text-xs text-slate-500 truncate">{file.directory}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-slate-300">{formatBytes(file.size)}</p>
        <p className="text-xs text-slate-600 mt-0.5">{file.ext.toUpperCase()}</p>
      </div>
    </motion.div>
  )
}

function BatchBar({ count, files, onDelete, onClear }) {
  const { selectedIds } = useMediaStore()

  const handleDelete = async () => {
    const toDelete = files.filter((f) => selectedIds.has(f.id))
    const paths = toDelete.map((f) => f.path)
    const result = await window.electron?.trash?.delete(paths)
    if (result?.success) {
      onDelete(toDelete)
      onClear()
      toast.success(`Moved ${toDelete.length} files to Recycle Bin`)
    }
  }

  return (
    <motion.div
      initial={{ y: -52, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -52, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-2.5 rounded-2xl"
      style={{
        background: 'rgba(18, 18, 30, 0.96)',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <span className="text-sm font-semibold text-white">{count} selected</span>
      <div className="w-px h-4 bg-white/10" />
      <button
        onClick={handleDelete}
        className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
      >
        Delete
      </button>
      <button
        onClick={onClear}
        className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
      >
        Clear
      </button>
    </motion.div>
  )
}

export default function MediaGrid({ files, isLoading }) {
  const { viewMode, selectedIds, clearSelection } = useMediaStore()
  const [deletedIds, setDeletedIds] = useState(new Set())

  const visibleFiles = useMemo(
    () => files.filter((f) => !deletedIds.has(f.id)),
    [files, deletedIds]
  )

  const handleDelete = useCallback((file) => {
    setDeletedIds((prev) => new Set([...prev, file.id]))
    useMediaStore.getState().addDeleted([file])
  }, [])

  const handleBatchDelete = useCallback((deleted) => {
    deleted.forEach((f) => handleDelete(f))
  }, [handleDelete])

  if (isLoading) {
    return (
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <SkeletonCard key={i} height={160 + (i % 4) * 36} />
        ))}
      </div>
    )
  }

  if (visibleFiles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full gap-3"
      >
        <div className="text-5xl">{'\uD83D\uDD0D'}</div>
        <p className="text-slate-400 font-semibold">No media found</p>
        <p className="text-slate-600 text-sm">Try a different filter or add another folder</p>
      </motion.div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="h-full overflow-y-auto scrollable px-3 py-3 space-y-0.5">
        {visibleFiles.map((file, i) => (
          <ListRow key={file.id} file={file} />
        ))}
      </div>
    )
  }

  return (
    <div className="h-full relative">
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BatchBar
            count={selectedIds.size}
            files={visibleFiles}
            onDelete={handleBatchDelete}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>

      <VirtuosoGrid
        style={{ height: '100%' }}
        totalCount={visibleFiles.length}
        overscan={600}
        listClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-5"
        itemClassName=""
        itemContent={(index) => (
          <MediaCard
            key={visibleFiles[index].id}
            file={visibleFiles[index]}
            index={index}
            onDelete={handleDelete}
          />
        )}
      />
    </div>
  )
}

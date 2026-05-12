import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Library, Clock, Heart,
  FolderOpen, HardDrive, Plus, X,
} from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'recents', label: 'Recents', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Heart },
]

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function Sidebar() {
  const { currentView, setView, folders, addFolder, removeFolder, files, isScanning } = useMediaStore()

  const stats = useMemo(() => ({
    totalSize: files.reduce((s, f) => s + f.size, 0),
    imageCount: files.filter((f) => f.type === 'image').length,
    videoCount: files.filter((f) => f.type === 'video').length,
  }), [files])

  const handleAddFolder = async () => {
    const paths = await window.electron?.dialog?.openFolder()
    if (!paths) return
    paths.forEach((p) => addFolder(p))
    setView('library')
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col shrink-0 border-r"
      style={{
        width: 'var(--sidebar-width)',
        background: 'rgba(9, 9, 15, 0.95)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Navigate</p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} active={currentView === item.id} onClick={() => setView(item.id)} />
            ))}
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Folders</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddFolder}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              title="Add folder"
            >
              <Plus size={12} />
            </motion.button>
          </div>

          {folders.length === 0 ? (
            <div
              className="mx-2 rounded-xl border border-dashed p-4 text-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              style={{ borderColor: 'var(--border)' }}
              onClick={handleAddFolder}
            >
              <FolderOpen size={18} className="text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500">Add a folder</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {folders.map((folder) => (
                <FolderItem key={folder} path={folder} onRemove={() => removeFolder(folder)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="px-3 pb-4">
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <HardDrive size={14} className="text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">Storage</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Images</p>
                <p className="font-semibold text-slate-200">{stats.imageCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Videos</p>
                <p className="font-semibold text-slate-200">{stats.videoCount.toLocaleString()}</p>
              </div>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate-500">{formatBytes(stats.totalSize)} scanned</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3"
          >
            <div
              className="rounded-xl p-2.5 flex items-center gap-2"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-300">Scanning&hellip;</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all relative ${
        active
          ? 'text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
      }`}
    >
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <Icon size={16} className={active ? 'text-indigo-400 relative z-10' : 'relative z-10'} />
      <span className="relative z-10">{item.label}</span>
      {active && (
        <motion.div
          className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-indigo-400"
          layoutId="nav-dot"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
    </motion.button>
  )
}

function FolderItem({ path, onRemove }) {
  const name = path.split(/[/\\]/).pop()
  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-default">
      <FolderOpen size={13} className="text-amber-400 shrink-0" />
      <span className="text-xs text-slate-300 truncate flex-1" title={path}>{name}</span>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
      >
        <X size={11} />
      </motion.button>
    </div>
  )
}

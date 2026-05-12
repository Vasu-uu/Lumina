import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, ArrowRight, Library, Clock, FolderOpen } from 'lucide-react'
import Fuse from 'fuse.js'
import useMediaStore from '../../store/useMediaStore'

const ACTIONS = [
  { id: 'go-library', label: 'Go to Library', icon: Library, action: (s) => s.setView('library'), category: 'Navigation' },
  { id: 'go-recents', label: 'Go to Recents', icon: Clock, action: (s) => s.setView('recents'), category: 'Navigation' },
  { id: 'add-folder', label: 'Add Folder\u2026', icon: FolderOpen, action: async (s) => {
    const paths = await window.electron?.dialog?.openFolder()
    if (paths) { paths.forEach((p) => s.addFolder(p)); s.setView('library') }
  }, category: 'Actions' },
  { id: 'filter-all', label: 'Show All Media', icon: Library, action: (s) => s.setFilterType('all'), category: 'Filters' },
  { id: 'filter-images', label: 'Show Images Only', icon: Library, action: (s) => s.setFilterType('image'), category: 'Filters' },
  { id: 'filter-videos', label: 'Show Videos Only', icon: Library, action: (s) => s.setFilterType('video'), category: 'Filters' },
]

export default function CommandPalette() {
  const { closeCommandPalette, files } = useMediaStore()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const fuse = useMemo(() => new Fuse([...ACTIONS, ...files.slice(0, 500).map((f) => ({
    id: f.id,
    label: f.name,
    icon: null,
    isFile: true,
    file: f,
    category: f.type === 'video' ? 'Videos' : 'Images',
  }))], { keys: ['label'], threshold: 0.4 }), [files])

  const results = useMemo(() => {
    return query
      ? fuse.search(query).map((r) => r.item).slice(0, 12)
      : ACTIONS.slice(0, 8)
  }, [query, fuse])

  useEffect(() => { setActiveIndex(0) }, [query])

  const handleKey = (e) => {
    if (e.key === 'Escape') closeCommandPalette()
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); executeResult(results[activeIndex]) }
  }

  const executeResult = (result) => {
    if (!result) return
    const store = useMediaStore.getState()
    if (result.isFile) {
      const idx = store.files.findIndex((f) => f.id === result.file.id)
      store.setActiveMedia(result.file, idx)
      store.addRecent(result.file)
    } else {
      result.action(store)
    }
    closeCommandPalette()
  }

  const grouped = useMemo(() => {
    return results.reduce((acc, r) => {
      const cat = r.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(r)
      return acc
    }, {})
  }, [results])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={closeCommandPalette}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15, 15, 26, 0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(40px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files and actions\u2026"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent border-none text-slate-100 text-sm outline-none placeholder:text-slate-600"
            style={{ padding: 0 }}
          />
          <kbd className="text-xs text-slate-600 px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-600">
              <Command size={24} className="mb-2" />
              <p className="text-sm">No results</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs text-slate-600 px-4 py-1.5 font-medium uppercase tracking-wider">{category}</p>
                {items.map((result) => {
                  const globalIdx = results.indexOf(result)
                  const isActive = globalIdx === activeIndex
                  const Icon = result.icon
                  return (
                    <motion.button
                      key={result.id}
                      onClick={() => executeResult(result)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                      style={{
                        background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: isActive ? '#fff' : '#94a3b8',
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {Icon
                        ? <Icon size={15} className={isActive ? 'text-indigo-400' : 'text-slate-600'} />
                        : <div className={`w-4 h-4 rounded text-xs flex items-center justify-center font-bold ${result.category === 'Videos' ? 'bg-violet-500/20 text-violet-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {result.category === 'Videos' ? '\u25B6' : '\uD83D\uDCF7'}
                          </div>
                      }
                      <span className="flex-1 text-sm truncate">{result.label}</span>
                      {isActive && <ArrowRight size={12} className="text-indigo-400 shrink-0" />}
                    </motion.button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div
          className="flex items-center gap-4 px-4 py-2.5 border-t text-xs text-slate-600"
          style={{ borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <span className="flex items-center gap-1"><kbd className="font-mono">{'\u2191\u2193'}</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">{'\u21B5'}</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

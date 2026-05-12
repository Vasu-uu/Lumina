import React from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Grid3X3, List, ArrowUpDown } from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'size', label: 'Size' },
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
]

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
]

export default function TopBar() {
  const {
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    filterType, setFilterType,
    viewMode, setViewMode,
    currentView, files,
  } = useMediaStore()

  const showControls = ['library', 'recents', 'favorites'].includes(currentView)

  return (
    <div
      className="flex items-center gap-3 px-4 shrink-0 border-b"
      style={{
        height: 'var(--topbar-height)',
        background: 'rgba(9, 9, 15, 0.8)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {showControls && (
        <>
          <div
            className="flex items-center gap-0.5 rounded-xl p-0.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <FilterTab
                key={opt.value}
                active={filterType === opt.value}
                onClick={() => setFilterType(opt.value)}
                label={opt.label}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs rounded-xl py-1.5 px-2.5 cursor-pointer"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 rounded-xl transition-colors"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: sortOrder === 'desc' ? 'var(--accent)' : 'var(--text-muted)',
              }}
              title={`Order: ${sortOrder === 'desc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown size={13} style={{ transform: sortOrder === 'asc' ? 'scaleY(-1)' : 'none', transition: 'transform 0.2s' }} />
            </motion.button>
          </div>

          <div
            className="flex items-center gap-0.5 rounded-xl p-0.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <ViewBtn icon={Grid3X3} active={viewMode === 'grid'} onClick={() => setViewMode('grid')} />
            <ViewBtn icon={List} active={viewMode === 'list'} onClick={() => setViewMode('list')} />
          </div>
        </>
      )}

      {files.length > 0 && (
        <span className="text-xs text-slate-500 font-medium tabular-nums hidden lg:block">
          {files.length.toLocaleString()} files
        </span>
      )}
    </div>
  )
}

function FilterTab({ active, onClick, label }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative px-3 py-1 rounded-lg text-xs font-medium transition-colors"
      style={{ color: active ? '#fff' : 'var(--text-muted)' }}
    >
      {active && (
        <motion.div
          layoutId="filter-active"
          className="absolute inset-0 rounded-lg"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(99,102,241,0.3)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </motion.button>
  )
}

function ViewBtn({ icon: Icon, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="relative p-1.5 rounded-lg transition-colors"
      style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {active && (
        <motion.div
          layoutId="view-active"
          className="absolute inset-0 rounded-lg"
          style={{ background: 'rgba(99,102,241,0.15)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}
      <Icon size={14} className="relative z-10" />
    </motion.button>
  )
}

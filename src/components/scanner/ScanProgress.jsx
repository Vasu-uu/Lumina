import React from 'react'
import { motion } from 'framer-motion'
import { Scan, FileImage, FileVideo, HardDrive, FolderSearch } from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function ScanProgress() {
  const { scanProgress, files } = useMediaStore()
  if (!scanProgress) return null

  const imageCount = files.filter((f) => f.type === 'image').length
  const videoCount = files.filter((f) => f.type === 'video').length

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-6 mt-4 rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(99,102,241,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Scan size={16} className="text-indigo-400" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-indigo-200">Scanning folder\u2026</p>
          <p className="text-xs text-indigo-400/70 truncate mt-0.5">
            {scanProgress.currentDir || '\u2014'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white tabular-nums">
            {(scanProgress.scanned || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">files found</p>
        </div>
      </div>

      <div className="relative h-0.5 overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3"
          style={{ background: 'linear-gradient(90deg, transparent, #6366f1, transparent)' }}
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="grid grid-cols-4 divide-x px-0 py-3" style={{ divideColor: 'var(--border)' }}>
        <StatCell icon={FileImage} label="Images" value={imageCount.toLocaleString()} color="text-blue-400" />
        <StatCell icon={FileVideo} label="Videos" value={videoCount.toLocaleString()} color="text-violet-400" />
        <StatCell icon={HardDrive} label="Size" value={formatBytes(scanProgress.totalSize || 0)} color="text-emerald-400" />
        <StatCell icon={FolderSearch} label="Scanning" value={scanProgress.lastFile ? '\u2026' + scanProgress.lastFile.slice(-12) : '\u2014'} color="text-amber-400" />
      </div>
    </motion.div>
  )
}

function StatCell({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-1">
      <Icon size={14} className={color} />
      <p className="text-xs font-semibold text-slate-200 tabular-nums truncate max-w-[80px] text-center">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  )
}

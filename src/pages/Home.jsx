import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, ArrowRight, Layers, Zap, BarChart2, Shield } from 'lucide-react'
import useMediaStore from '../store/useMediaStore'
import FolderPicker from '../components/scanner/FolderPicker'
import ScanProgress from '../components/scanner/ScanProgress'
import { AnimatePresence } from 'framer-motion'

function formatBytes(bytes) {
  const k = 1024, s = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes || 1) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}

export default function Home() {
  const { files, isScanning, scanProgress } = useMediaStore()
  const hasMedia = files.length > 0

  return (
    <div className="h-full overflow-y-auto scrollable relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 50% 40% at 20% 20%, rgba(99,102,241,0.07) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 30% at 80% 70%, rgba(139,92,246,0.05) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <AnimatePresence>
        {isScanning && <ScanProgress />}
      </AnimatePresence>

      {!hasMedia ? (
        <FolderPicker />
      ) : (
        <WelcomeBack />
      )}
    </div>
  )
}

function WelcomeBack() {
  const { files, setView } = useMediaStore()

  const stats = useMemo(() => ({
    images: files.filter((f) => f.type === 'image').length,
    videos: files.filter((f) => f.type === 'video').length,
    totalSize: files.reduce((s, f) => s + f.size, 0),
  }), [files])

  const CARDS = [
    { icon: FolderOpen, label: 'Library', desc: 'Browse all media', view: 'library', color: 'from-indigo-500 to-violet-600' },
    { icon: BarChart2, label: 'Analytics', desc: 'Storage insights', view: 'analytics', color: 'from-emerald-500 to-teal-600' },
    { icon: Zap, label: 'Recents', desc: 'Recently viewed', view: 'recents', color: 'from-amber-500 to-orange-600' },
    { icon: Shield, label: 'Recycle Bin', desc: 'Deleted files', view: 'recycle', color: 'from-red-500 to-rose-600' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm">Your media library is ready</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Images', value: stats.images.toLocaleString(), color: 'text-blue-400' },
            { label: 'Videos', value: stats.videos.toLocaleString(), color: 'text-violet-400' },
            { label: 'Total Size', value: formatBytes(stats.totalSize), color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        {CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.button
              key={card.view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView(card.view)}
              className="flex items-center justify-between p-5 rounded-2xl text-left transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.color}`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{card.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-600" />
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

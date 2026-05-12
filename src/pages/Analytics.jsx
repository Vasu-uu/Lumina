import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { HardDrive, FileImage, FileVideo, TrendingUp, Award } from 'lucide-react'
import useMediaStore from '../store/useMediaStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, s = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${s[i]}`
}

const CHART_COLORS = {
  indigo: 'rgba(99,102,241,0.8)',
  violet: 'rgba(139,92,246,0.8)',
  blue: 'rgba(59,130,246,0.8)',
  emerald: 'rgba(16,185,129,0.8)',
  amber: 'rgba(245,158,11,0.8)',
  rose: 'rgba(244,63,94,0.8)',
  cyan: 'rgba(6,182,212,0.8)',
  pink: 'rgba(236,72,153,0.8)',
  teal: 'rgba(20,184,166,0.8)',
  orange: 'rgba(249,115,22,0.8)',
}
const COLORS_ARR = Object.values(CHART_COLORS)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,15,26,0.95)',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      padding: 10,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#475569', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#475569', font: { size: 11 }, callback: (v) => formatBytes(v) },
    },
  },
}

export default function Analytics() {
  const { getAnalytics, files } = useMediaStore()
  const analytics = useMemo(() => getAnalytics(), [getAnalytics, files])

  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <TrendingUp size={48} className="text-slate-700" />
        <p className="text-slate-400 font-medium">No data yet</p>
        <p className="text-slate-600 text-sm">Scan a folder to see storage analytics</p>
      </div>
    )
  }

  const { images, videos, totalSize, imageSize, videoSize, largest, extBreakdown, total } = analytics

  const donutData = {
    labels: ['Images', 'Videos'],
    datasets: [{
      data: [imageSize, videoSize],
      backgroundColor: [CHART_COLORS.indigo, CHART_COLORS.violet],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  const barData = {
    labels: extBreakdown.map((e) => e.ext.toUpperCase()),
    datasets: [{
      label: 'Size',
      data: extBreakdown.map((e) => e.size),
      backgroundColor: COLORS_ARR.slice(0, extBreakdown.length),
      borderRadius: 8,
      borderSkipped: false,
    }],
  }

  const STAT_CARDS = [
    { icon: HardDrive, label: 'Total Size', value: formatBytes(totalSize), color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)' },
    { icon: FileImage, label: 'Images', value: images.length.toLocaleString(), color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
    { icon: FileVideo, label: 'Videos', value: videos.length.toLocaleString(), color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)' },
    { icon: Award, label: 'Total Files', value: total.toLocaleString(), color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
  ]

  return (
    <div className="h-full overflow-y-auto scrollable p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                    <Icon size={17} className={card.color} />
                  </div>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</p>
                <p className="text-slate-500 text-xs mt-1">{card.label}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Storage by Type</h3>
            <p className="text-xs text-slate-500 mb-5">Images vs Videos breakdown</p>
            <div className="h-52 relative">
              <Doughnut
                data={donutData}
                options={{
                  ...chartDefaults,
                  scales: undefined,
                  plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: { color: '#64748b', font: { size: 12 }, padding: 16, usePointStyle: true },
                    },
                  },
                  cutout: '70%',
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-white">{formatBytes(totalSize)}</p>
                <p className="text-xs text-slate-500">total</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold text-slate-200 mb-1">By Extension</h3>
            <p className="text-xs text-slate-500 mb-5">Storage per file type</p>
            <div className="h-52">
              <Bar data={barData} options={chartDefaults} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold text-slate-200">Largest Files</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top {largest.length} files by size</p>
          </div>
          <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
            {largest.map((file, i) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => {
                  const store = useMediaStore.getState()
                  store.setActiveMedia(file, store.files.findIndex((f) => f.id === file.id))
                }}
              >
                <span className="text-slate-600 text-xs font-mono w-5 tabular-nums text-right">{i + 1}</span>
                <div
                  className="w-1.5 rounded-full"
                  style={{
                    height: `${Math.max(8, Math.round((file.size / largest[0].size) * 32))}px`,
                    background: COLORS_ARR[i % COLORS_ARR.length],
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500 truncate">{file.directory}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: COLORS_ARR[i % COLORS_ARR.length] }}>
                    {formatBytes(file.size)}
                  </p>
                  <p className="text-xs text-slate-600">{file.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, RotateCcw, ExternalLink, FileImage, FileVideo } from 'lucide-react'
import useMediaStore from '../store/useMediaStore'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '\u2014' }
}

export default function RecycleBin() {
  const { deletedFiles, clearDeleted } = useMediaStore()

  const openSystemBin = () => {
    window.electron?.trash?.openBin()
  }

  if (deletedFiles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <Trash2 size={28} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-slate-400 font-medium">Recycle Bin is empty</p>
          <p className="text-slate-600 text-sm mt-1">Files you delete will appear here during this session</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openSystemBin}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <ExternalLink size={14} />
          Open System Recycle Bin
        </motion.button>
      </div>
    )
  }

  const totalSize = deletedFiles.reduce((s, f) => s + f.size, 0)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 shrink-0 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-white flex items-center gap-2"
          >
            <Trash2 size={18} className="text-red-400" />
            Recycle Bin
          </motion.h2>
          <p className="text-slate-500 text-sm">
            {deletedFiles.length} files &middot; {formatBytes(totalSize)} freed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openSystemBin}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <ExternalLink size={13} />
            System Bin
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={clearDeleted}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-red-400 transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            Clear History
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable">
        <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
          {deletedFiles.map((file, i) => (
            <motion.div
              key={file.id + i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: file.type === 'video' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                  border: `1px solid ${file.type === 'video' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)'}`,
                }}
              >
                {file.type === 'video'
                  ? <FileVideo size={18} className="text-violet-400" />
                  : <FileImage size={18} className="text-blue-400" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{file.directory}</p>
              </div>

              <div className="text-right shrink-0 mr-2">
                <p className="text-sm text-slate-300 font-medium">{formatBytes(file.size)}</p>
                <p className="text-xs text-slate-600">{formatDate(file.modified)}</p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={openSystemBin}
                  title="Restore (opens system recycle bin)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-emerald-400 transition-colors"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <RotateCcw size={12} />
                  Restore
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-6 py-4">
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <span className="text-amber-400 text-sm">&#x2139;&#xFE0F;</span>
            <p className="text-xs text-amber-300/70 leading-relaxed">
              Files are moved to the Windows Recycle Bin and can be restored from there.
              This list tracks files deleted during the current session only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import useMediaStore from '../../store/useMediaStore'

export default function TitleBar() {
  const { currentView, folders } = useMediaStore()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.electron?.window?.isMaximized().then(setIsMaximized)
  }, [])

  const handleMaximize = async () => {
    await window.electron?.window?.maximize()
    const max = await window.electron?.window?.isMaximized()
    setIsMaximized(max)
  }

  const folderName = folders[0] ? folders[0].split(/[/\\]/).pop() : null

  return (
    <div
      className="drag-region flex items-center justify-between px-4 shrink-0 border-b"
      style={{
        height: 'var(--titlebar-height)',
        background: 'rgba(9, 9, 15, 0.95)',
        borderColor: 'var(--border)',
        zIndex: 100,
      }}
    >
      <div className="no-drag flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
          <Layers size={12} className="text-white" />
        </div>
        <span className="font-semibold text-sm text-gradient tracking-wide">Lumina</span>
        {folderName && (
          <span className="text-xs text-slate-500 ml-1 hidden sm:inline">
            &mdash; {folderName}
          </span>
        )}
      </div>

      <div className="flex-1 h-full" />

      <div className="no-drag flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.electron?.window?.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          title="Minimize"
        >
          <Minus size={13} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMaximize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <Square size={11} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.electron?.window?.close()}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          title="Close"
        >
          <X size={13} />
        </motion.button>
      </div>
    </div>
  )
}

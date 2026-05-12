import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import useMediaStore from '../store/useMediaStore'
import MediaGrid from '../components/media/MediaGrid'

export default function Recents() {
  const { recents, files } = useMediaStore()

  const recentFiles = useMemo(() => {
    return recents
      .map((id) => files.find((f) => f.id === id))
      .filter(Boolean)
  }, [recents, files])

  if (recentFiles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Clock size={48} className="text-slate-700" />
        <p className="text-slate-400 font-medium">No recently viewed media</p>
        <p className="text-slate-600 text-sm">Open files from your library to see them here</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 shrink-0">
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-white"
        >
          Recently Viewed
        </motion.h2>
        <p className="text-slate-500 text-sm">{recentFiles.length} files</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <MediaGrid files={recentFiles} />
      </div>
    </div>
  )
}

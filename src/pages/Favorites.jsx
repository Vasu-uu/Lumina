import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import useMediaStore from '../store/useMediaStore'
import MediaGrid from '../components/media/MediaGrid'

export default function Favorites() {
  const { favorites, files } = useMediaStore()

  const favoriteFiles = files.filter((f) => favorites.has(f.id))

  if (favoriteFiles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Heart size={48} className="text-slate-700" />
        <p className="text-slate-400 font-medium">No favorites yet</p>
        <p className="text-slate-600 text-sm">Click the heart icon on any media card to save it here</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 shrink-0">
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-white flex items-center gap-2"
        >
          <Heart size={18} className="text-pink-400 fill-pink-400" />
          Favorites
        </motion.h2>
        <p className="text-slate-500 text-sm">{favoriteFiles.length} saved files</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <MediaGrid files={favoriteFiles} />
      </div>
    </div>
  )
}

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMediaStore from '../store/useMediaStore'
import MediaGrid from '../components/media/MediaGrid'
import ScanProgress from '../components/scanner/ScanProgress'
import FolderPicker from '../components/scanner/FolderPicker'

export default function Library() {
  const { files, getFilteredFiles, isScanning, folders } = useMediaStore()
  const filtered = getFilteredFiles()
  const hasFolder = folders.length > 0

  if (!hasFolder) {
    return (
      <div className="h-full relative">
        <FolderPicker />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AnimatePresence>
        {isScanning && <ScanProgress />}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden">
        <MediaGrid files={filtered} isLoading={isScanning && files.length === 0} />
      </div>
    </div>
  )
}

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { FolderOpen, Layers, Sparkles, ArrowRight } from 'lucide-react'
import useMediaStore from '../../store/useMediaStore'
import toast from 'react-hot-toast'

export default function FolderPicker() {
  const { addFolder, setView, setIsScanning, setScanProgress, setFiles, appendFiles } = useMediaStore()

  const startScan = async (paths) => {
    setIsScanning(true)
    setScanProgress({ scanned: 0, totalSize: 0, currentDir: '\u2026' })
    setFiles([])

    let allFiles = []
    for (const folderPath of paths) {
      addFolder(folderPath)
      try {
        const unlisten = window.electron?.scanner?.onProgress((prog) => {
          setScanProgress(prog)
        })

        const files = await window.electron?.scanner?.scan(folderPath)
        if (unlisten) unlisten()

        if (files && files.length > 0) {
          allFiles = [...allFiles, ...files]
          appendFiles(files)
        }
      } catch (e) {
        toast.error(`Failed to scan: ${e.message}`)
      }
    }

    setIsScanning(false)
    setScanProgress(null)

    if (allFiles.length > 0) {
      toast.success(`Found ${allFiles.length.toLocaleString()} media files`)
      setView('library')
    } else {
      toast('No media files found in selected folder', { icon: '\uD83D\uDCC2' })
    }
  }

  const handleBrowse = async () => {
    const paths = await window.electron?.dialog?.openFolder()
    if (!paths || paths.length === 0) return
    await startScan(paths)
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    const paths = [...new Set(acceptedFiles.map((f) => {
      const p = f.path
      const parts = p.replace(/\\/g, '/').split('/')
      parts.pop()
      return parts.join('/')
    }))]
    if (paths.length > 0) await startScan(paths)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'video/*': [],
      'image/*': [],
    },
  })

  return (
    <div className="flex flex-col items-center justify-center h-full px-8" {...getRootProps()}>
      <input {...getInputProps()} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center max-w-lg w-full relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 60px rgba(99,102,241,0.2)',
            }}
          >
            <Layers size={40} className="text-indigo-400" />
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={10} className="text-white" />
            </motion.div>
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold text-center mb-3" style={{ lineHeight: 1.2 }}>
          <span className="text-gradient">Your media,</span>
          <br />
          <span className="text-slate-200">beautifully organized</span>
        </h1>
        <p className="text-slate-400 text-center text-sm mb-10 max-w-sm leading-relaxed">
          Select a folder from your computer and Lumina will scan, organize, and visualize your photos and videos with a premium experience.
        </p>

        <motion.div
          animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
          className="w-full rounded-2xl p-8 mb-6 text-center transition-all"
          style={{
            background: isDragActive
              ? 'rgba(99,102,241,0.12)'
              : 'rgba(255,255,255,0.02)',
            border: `2px dashed ${isDragActive ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: isDragActive ? '0 0 40px rgba(99,102,241,0.15)' : 'none',
          }}
        >
          {isDragActive ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <FolderOpen size={32} className="text-indigo-400 mx-auto mb-2" />
              <p className="text-indigo-300 font-medium">Drop to scan this folder</p>
            </motion.div>
          ) : (
            <div>
              <FolderOpen size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Drag &amp; drop folders here</p>
              <p className="text-slate-600 text-xs mt-1">or use the button below</p>
            </div>
          )}
        </motion.div>

        <motion.button
          onClick={handleBrowse}
          whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
          }}
        >
          <FolderOpen size={18} />
          <span>Choose Folder</span>
          <ArrowRight size={16} className="ml-1" />
        </motion.button>

        <div className="flex gap-6 mt-10">
          {[
            { label: 'Images' },
            { label: 'Videos' },
            { label: 'Analytics' },
            { label: 'Safe Delete' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              {f.label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

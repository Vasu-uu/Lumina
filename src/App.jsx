import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import useMediaStore from './store/useMediaStore'
import TitleBar from './components/layout/TitleBar'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import VideoPlayer from './components/media/VideoPlayer'
import ImageViewer from './components/media/ImageViewer'
import Home from './pages/Home'
import Library from './pages/Library'
import Analytics from './pages/Analytics'
import Recents from './pages/Recents'
import Favorites from './pages/Favorites'
import RecycleBin from './pages/RecycleBin'

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
}

const PAGES = {
  home: <Home />,
  library: <Library />,
  analytics: <Analytics />,
  recents: <Recents />,
  favorites: <Favorites />,
  recycle: <RecycleBin />,
}

export default function App() {
  const { currentView, activeMedia, theme } = useMediaStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex flex-col h-screen bg-[#09090f] text-slate-100 overflow-hidden">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 38px)' }}>
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />

          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0"
              >
                {PAGES[currentView] || <Home />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {activeMedia?.type === 'video' && <VideoPlayer />}
        {activeMedia?.type === 'image' && <ImageViewer />}
      </AnimatePresence>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
        }}
      />
    </div>
  )
}

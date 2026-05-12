import { create } from 'zustand'

const useMediaStore = create((set, get) => ({
  folders: [],
  addFolder: (folderPath) => set((s) => ({
    folders: s.folders.includes(folderPath) ? s.folders : [...s.folders, folderPath],
  })),
  removeFolder: (folderPath) => set((s) => ({
    folders: s.folders.filter((f) => f !== folderPath),
    files: s.files.filter((f) => !f.path.startsWith(folderPath)),
  })),

  files: [],
  setFiles: (files) => set({ files }),
  appendFiles: (newFiles) => set((s) => ({ files: [...s.files, ...newFiles] })),
  clearFiles: () => set({ files: [] }),

  isScanning: false,
  scanProgress: null,
  setIsScanning: (v) => set({ isScanning: v }),
  setScanProgress: (p) => set({ scanProgress: p }),

  currentView: 'home',
  setView: (view) => set({ currentView: view }),

  sortBy: 'date',
  sortOrder: 'desc',
  filterType: 'all',
  setSortBy: (v) => set({ sortBy: v }),
  setSortOrder: (v) => set({ sortOrder: v }),
  setFilterType: (v) => set({ filterType: v }),

  selectedIds: new Set(),
  toggleSelect: (id) => set((s) => {
    const next = new Set(s.selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    return { selectedIds: next }
  }),
  selectAll: () => set((s) => ({ selectedIds: new Set(s.getFilteredFiles().map((f) => f.id)) })),
  clearSelection: () => set({ selectedIds: new Set() }),

  activeMedia: null,
  activeMediaIdx: null,
  setActiveMedia: (file, idx) => set({ activeMedia: file, activeMediaIdx: idx }),
  closeViewer: () => set({ activeMedia: null, activeMediaIdx: null }),
  nextMedia: () => {
    const { activeMediaIdx, getFilteredFiles } = get()
    const files = getFilteredFiles()
    if (activeMediaIdx === null) return
    const nextIdx = (activeMediaIdx + 1) % files.length
    set({ activeMedia: files[nextIdx], activeMediaIdx: nextIdx })
  },
  prevMedia: () => {
    const { activeMediaIdx, getFilteredFiles } = get()
    const files = getFilteredFiles()
    if (activeMediaIdx === null) return
    const prevIdx = (activeMediaIdx - 1 + files.length) % files.length
    set({ activeMedia: files[prevIdx], activeMediaIdx: prevIdx })
  },

  favorites: new Set(),
  toggleFavorite: (id) => set((s) => {
    const next = new Set(s.favorites)
    next.has(id) ? next.delete(id) : next.add(id)
    return { favorites: next }
  }),

  recents: [],
  addRecent: (file) => set((s) => {
    const next = [file.id, ...s.recents.filter((id) => id !== file.id)].slice(0, 50)
    return { recents: next }
  }),

  deletedFiles: [],
  addDeleted: (files) => set((s) => ({ deletedFiles: [...files, ...s.deletedFiles] })),
  clearDeleted: () => set({ deletedFiles: [] }),



  viewMode: 'grid',
  setViewMode: (v) => set({ viewMode: v }),

  theme: 'dark',
  setTheme: (t) => set({ theme: t }),

  _filteredCache: null,
  _filteredCacheKey: null,
  getFilteredFiles: () => {
    const { files, filterType, sortBy, sortOrder, favorites, recents, currentView } = get()
    const cacheKey = JSON.stringify({ files, filterType, sortBy, sortOrder, currentView, favorites: [...favorites], recents })

    if (get()._filteredCacheKey === cacheKey) {
      return get()._filteredCache
    }

    let result = [...files]

    if (currentView === 'favorites') {
      result = result.filter((f) => favorites.has(f.id))
    } else if (currentView === 'recents') {
      const recentSet = new Map(recents.map((id, i) => [id, i]))
      result = result.filter((f) => recentSet.has(f.id))
      result.sort((a, b) => recentSet.get(a.id) - recentSet.get(b.id))
      set({ _filteredCache: result, _filteredCacheKey: cacheKey })
      return result
    }

    if (filterType !== 'all') {
      result = result.filter((f) => f.type === filterType)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'date') cmp = a.modifiedMs - b.modifiedMs
      if (sortBy === 'size') cmp = a.size - b.size
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
      if (sortBy === 'type') cmp = a.type.localeCompare(b.type)
      if (sortBy === 'duration') cmp = (a.duration || 0) - (b.duration || 0)
      return sortOrder === 'desc' ? -cmp : cmp
    })

    set({ _filteredCache: result, _filteredCacheKey: cacheKey })
    return result
  },

  _analyticsCache: null,
  _analyticsCacheKey: null,
  getAnalytics: () => {
    const { files } = get()
    const cacheKey = files.length + '-' + (files[0]?.id || '')

    if (get()._analyticsCacheKey === cacheKey) {
      return get()._analyticsCache
    }

    const images = files.filter((f) => f.type === 'image')
    const videos = files.filter((f) => f.type === 'video')
    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    const imageSize = images.reduce((acc, f) => acc + f.size, 0)
    const videoSize = videos.reduce((acc, f) => acc + f.size, 0)

    const sorted = [...files].sort((a, b) => b.size - a.size)
    const largest = sorted.slice(0, 20)

    const extMap = {}
    files.forEach((f) => {
      extMap[f.ext] = (extMap[f.ext] || 0) + f.size
    })
    const extBreakdown = Object.entries(extMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ext, size]) => ({ ext, size }))

    const analytics = { images, videos, totalSize, imageSize, videoSize, largest, extBreakdown, total: files.length }
    set({ _analyticsCache: analytics, _analyticsCacheKey: cacheKey })
    return analytics
  },
}))

export default useMediaStore

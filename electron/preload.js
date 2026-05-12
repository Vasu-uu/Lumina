const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  window: {
    minimize:    function () { return ipcRenderer.invoke('window:minimize') },
    maximize:    function () { return ipcRenderer.invoke('window:maximize') },
    close:       function () { return ipcRenderer.invoke('window:close') },
    isMaximized: function () { return ipcRenderer.invoke('window:isMaximized') },
  },

  dialog: {
    openFolder: function () { return ipcRenderer.invoke('dialog:openFolder') },
  },

  scanner: {
    scan: function (folderPath) { return ipcRenderer.invoke('scanner:scan', folderPath) },
    onProgress: function (cb) {
      var handler = function (_, data) { cb(data) }
      ipcRenderer.on('scanner:progress', handler)
      return function () { ipcRenderer.removeListener('scanner:progress', handler) }
    },
  },

  trash: {
    delete:  function (filePaths) { return ipcRenderer.invoke('trash:delete', filePaths) },
    openBin: function ()          { return ipcRenderer.invoke('trash:openBin') },
  },

  shell: {
    showInExplorer: function (filePath) { return ipcRenderer.invoke('shell:showInExplorer', filePath) },
    openFile:       function (filePath) { return ipcRenderer.invoke('shell:openFile', filePath) },
  },

  store: {
    get:    function (key)        { return ipcRenderer.invoke('store:get', key) },
    set:    function (key, value) { return ipcRenderer.invoke('store:set', key, value) },
    delete: function (key)        { return ipcRenderer.invoke('store:delete', key) },
  },

  theme: {
    get: function ()      { return ipcRenderer.invoke('theme:get') },
    set: function (theme) { return ipcRenderer.invoke('theme:set', theme) },
  },

  fileServer: {
    port: function () { return ipcRenderer.invoke('fileServer:port') },
  },
})

const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron')
const path = require('path')
const Store = require('electron-store')
const { startFileServer, PORT } = require('./fileServer')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow

startFileServer()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1024, minHeight: 680,
    frame: false, titleBarStyle: 'hidden',
    backgroundColor: '#09090f', show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, webSecurity: false,
    },
  })

  if (isDev) mainWindow.loadURL('http://localhost:5173')
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))

  mainWindow.once('ready-to-show', function () { mainWindow.show(); mainWindow.focus() })
  mainWindow.on('closed', function () { mainWindow = null })
}

ipcMain.handle('window:minimize', function () { if (mainWindow) mainWindow.minimize() })
ipcMain.handle('window:maximize', function () {
  if (!mainWindow) return
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
})
ipcMain.handle('window:close', function () { if (mainWindow) mainWindow.close() })
ipcMain.handle('window:isMaximized', function () { return mainWindow ? mainWindow.isMaximized() : false })
ipcMain.handle('fileServer:port', function () { return PORT })

ipcMain.handle('dialog:openFolder', async function () {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'multiSelections'],
    title: 'Select Media Folders',
    buttonLabel: 'Select Folder',
  })
  if (result.canceled) return null
  return result.filePaths
})

const { scanFolder } = require('./scanner')

ipcMain.handle('scanner:scan', async function (event, folderPath) {
  return new Promise(function (resolve, reject) {
    scanFolder(folderPath, function (progress) {
      event.sender.send('scanner:progress', progress)
    }, function (files) { resolve(files) }, function (err) { reject(err) })
  })
})

ipcMain.handle('trash:delete', async function (event, filePaths) {
  const trash = (await import('trash')).default
  try { await trash(filePaths); return { success: true } }
  catch (e) { return { success: false, error: e.message } }
})

ipcMain.handle('trash:openBin', async function () { shell.openPath('shell:RecycleBinFolder') })
ipcMain.handle('shell:showInExplorer', async function (event, filePath) { shell.showItemInFolder(filePath) })
ipcMain.handle('shell:openFile', async function (event, filePath) { shell.openPath(filePath) })
ipcMain.handle('store:get', function (event, key) { return store.get(key) })
ipcMain.handle('store:set', function (event, key, value) { store.set(key, value); return true })
ipcMain.handle('store:delete', function (event, key) { store.delete(key); return true })
ipcMain.handle('theme:get', function () { return nativeTheme.shouldUseDarkColors ? 'dark' : 'light' })
ipcMain.handle('theme:set', function (event, theme) { nativeTheme.themeSource = theme })

app.whenReady().then(function () {
  createWindow()
  app.on('activate', function () { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', function () { if (process.platform !== 'darwin') app.quit() })

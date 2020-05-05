import { join } from 'path'
import url from 'url'
import { app, BrowserWindow, ipcMain } from 'electron'
import { is } from 'electron-util'
import Store from 'electron-store'

app.allowRendererProcessReuse = true
const configFile = new Store({
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 }
    },
    scan_prefix: 'AAA'
  }
});
const configData = configFile.store

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    ...configData.windowBounds.main,
    show: false,
    useContentSize: true,
    defaultEncoding: 'utf-8',
    webPreferences: {
      nodeIntegration: true,
    },
    title: `${app.name}`,
    icon: join(__dirname, '../icons/icon.icns')
  })
  mainWindow.removeMenu()
  mainWindow.loadURL(
    url.format({
      pathname: join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    }))
  if (is.development || process.argv.some(a => a === '--devtools')) mainWindow.openDevTools()

  mainWindow.on('close', async e => {
    if (!configData.close) {
      e.preventDefault()
      configFile.set('windowBounds.main', mainWindow.getBounds())
      mainWindow.webContents.send('close_db')
      console.log('Konfigurationsdaten gespeichert, Datenbank geschlossen')
      configData.close = true
      mainWindow.close()
    }
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', async () => {
    mainWindow.show()
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.on('print', (event, arg) => {
  const options = {
    margins: 'none'
  }
  mainWindow.webContents.print(options, (success, errorType) => {
    event.reply('asynchronous-reply', success)
  })
})
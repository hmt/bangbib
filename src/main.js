import url from 'url'
import { app, BrowserWindow, ipcMain } from 'electron'
import { is } from 'electron-util'
import { join, dirname } from "path";
import { writeFile, existsSync, mkdirSync } from "fs";
import configData from './configstore'

let mainWindow

if (!configData.get('pdf_verzeichnis')) {
  configData.set('pdf_verzeichnis', join(app.getPath('documents'), app.getName(), 'Kurslisten'))
}

function createWindow() {
  mainWindow = new BrowserWindow({
    ...configData.get('windowBounds.main'),
    show: false,
    useContentSize: true,
    defaultEncoding: 'utf-8',
    webPreferences: {
      nodeIntegration: true
    },
    title: `${app.name}`
    // icon: join(__dirname, '../icons/icon.png')
  })
  mainWindow.removeMenu()
  mainWindow.loadURL(
    url.format({
      pathname: join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    }))
  if (is.development || process.argv.some(a => a === '--devtools')) mainWindow.openDevTools()

  mainWindow.on('close', e => {
    if (!configData.get('close')) {
      e.preventDefault()
      configData.set('windowBounds.main', mainWindow.getBounds())
      mainWindow.webContents.send('close_db')
      console.log('Konfigurationsdaten gespeichert, Datenbank geschlossen')
      configData.set('close', true)
      mainWindow.close()
    }
  })
  mainWindow.once('ready-to-show', async () => {
    mainWindow.show()
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  app.quit()
})
app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.on('print', (event, arg) => {
  const options = {
    margins: 'none'
  }
  mainWindow.webContents.print(options, (success, errorType) => {
    event.reply('print-reply', success)
  })
})

function ensureDirectoryExistence(filePath) {
  const dir = dirname(filePath);
  if (existsSync(dir)) {
    return true;
  }
  ensureDirectoryExistence(dir);
  try {
    mkdirSync(dir);
  } catch (e) {
    console.log(
      `Verzeichnis ${dir} konnte nicht erstellt werden: `,
      e.message
    );
  }
}

ipcMain.on('pdf', async (event, pdf_name) => {
  const pdf_path = join(configData.get('pdf_verzeichnis'), pdf_name);
  const options = {
    marginsType: 1,
  };
  try {
    const data = await mainWindow.webContents.printToPDF(options);
    ensureDirectoryExistence(pdf_path);
    writeFile(pdf_path, data, error => {
      if (error) throw error;
      console.log(pdf_path, 'erfolgreich gesichert')
      event.reply('pdf-reply', true)
    });
    return true
  } catch (e) {
    console.log(
      `PDF konnte nicht geschrieben werden: `,
      e.message
    );
    event.reply('pdf-reply', false)
  }
});
const MSICreator = require('electron-wix-msi').MSICreator
const path = require('path')

// Step 1: Instantiate the MSICreator
const msiCreator = new MSICreator({
  appDirectory: path.resolve(__dirname, 'release/bangbib-win32-ia32'),
  description: 'Desktop Anwendung - Schulbibliothek',
  exe: 'bangbib.exe',
  name: 'bangbib',
  manufacturer: process.env['AUTHOR'],
  upgradeCode: process.env['UPGRADECODE'],
  version: process.env['APPVEYOR_BUILD_VERSION'],
  outputDirectory: path.resolve(__dirname, 'release/msi'),
  shortcutFolderName: 'bangbib',
  language: 1031
})

async function createMSI () {
  // Step 2: Create a .wxs template file
  await msiCreator.create()
  // Step 3: Compile the template to a .msi file
  await msiCreator.compile()
}

createMSI().then(() => {
  console.log('MSI erfolgreich erstellt')
}, (e) => {
  console.log('Fehler beim erstellen der MSI', e)
})

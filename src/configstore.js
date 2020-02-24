import Store from 'electron-store'

const configFile = new Store({
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 }
    },
    scan_prefix: 'AAA'
  }
});
export default configFile

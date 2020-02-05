import { notification } from './stores.js'

export function send (icon, message, type = 'default', timeout, barcode) {
  notification.set({ icon, type, message, timeout, barcode })
}
export function fehler (msg, barcode, timeout) {
  send('error', msg, 'danger', timeout, barcode)
}
export function ausleihe (msg, barcode, timeout) {
  send('arrow_forward', msg, 'warning', timeout, barcode)
}
export function rueckgabe (msg, barcode, timeout) {
  send('arrow_back', msg, 'link', timeout, barcode)
}
export function zuordnung (msg, barcode, timeout) {
  send('plus_one', msg, 'success', timeout, barcode)
}
export function fertig (msg, barcode, timeout) {
  send('done', msg, 'primary', timeout, barcode)
}
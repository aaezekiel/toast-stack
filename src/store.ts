export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id: string
  message: string
  type: ToastType
  duration: number
  description?: string
  action?: ToastAction
  cancel?: ToastAction
}

type Listener = (toasts: ToastData[]) => void

let _toasts: ToastData[] = []
const _listeners = new Set<Listener>()

function _emit() {
  const snap = [..._toasts]
  _listeners.forEach(fn => fn(snap))
}

export function addToast(data: Omit<ToastData, 'id'>): string {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  _toasts = [{ ...data, id }, ..._toasts]
  _emit()
  return id
}

export function removeToast(id: string): void {
  _toasts = _toasts.filter(t => t.id !== id)
  _emit()
}

export function clearToasts(): void {
  _toasts = []
  _emit()
}

export function subscribe(fn: Listener): () => void {
  _listeners.add(fn)
  return () => _listeners.delete(fn)
}

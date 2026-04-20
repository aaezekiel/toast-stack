import { addToast, removeToast, clearToasts, type ToastAction } from './store'

export interface ToastOptions {
  duration?: number
  description?: string
  action?: ToastAction
  cancel?: ToastAction
}

const DEFAULT_DURATION = 4000

function toast(message: string, opts: ToastOptions = {}): string {
  return addToast({ message, type: 'default', duration: opts.duration ?? DEFAULT_DURATION, ...opts })
}

toast.success = (message: string, opts: ToastOptions = {}): string =>
  addToast({ message, type: 'success', duration: opts.duration ?? DEFAULT_DURATION, ...opts })

toast.error = (message: string, opts: ToastOptions = {}): string =>
  addToast({ message, type: 'error', duration: opts.duration ?? DEFAULT_DURATION, ...opts })

toast.warning = (message: string, opts: ToastOptions = {}): string =>
  addToast({ message, type: 'warning', duration: opts.duration ?? DEFAULT_DURATION, ...opts })

toast.info = (message: string, opts: ToastOptions = {}): string =>
  addToast({ message, type: 'info', duration: opts.duration ?? DEFAULT_DURATION, ...opts })

toast.dismiss = (id?: string): void => {
  if (id !== undefined) removeToast(id)
  else clearToasts()
}

export { toast }

import { useState, useCallback } from 'react'
import { Toast, ToastType } from '@/components/ui/toast'

let toastIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = { id, type, message, duration }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    return addToast('success', message, duration)
  }, [addToast])

  const error = useCallback((message: string, duration?: number) => {
    return addToast('error', message, duration)
  }, [addToast])

  const warning = useCallback((message: string, duration?: number) => {
    return addToast('warning', message, duration)
  }, [addToast])

  const info = useCallback((message: string, duration?: number) => {
    return addToast('info', message, duration)
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}

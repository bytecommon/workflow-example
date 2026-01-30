import React, { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  }
  return icons[type]
}

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const duration = toast.duration || 3000
    const interval = 100
    const step = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    const timeout = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [toast.id, toast.duration, onClose])

  return (
    <div className="flex items-start gap-3 bg-background border border-border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md animate-in slide-in-from-right-full">
      <ToastIcon type={toast.type} />
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-current transition-all duration-100"
            style={{
              width: `${progress}%`,
              color: toast.type === 'success' ? '#22c55e' :
                     toast.type === 'error' ? '#ef4444' :
                     toast.type === 'warning' ? '#eab308' : '#3b82f6'
            }}
          />
        </div>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

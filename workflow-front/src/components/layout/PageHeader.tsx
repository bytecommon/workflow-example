import React from 'react'
import { Button } from '../ui/button'
import { RefreshCw, Plus, Download } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  onRefresh?: () => void
}

export function PageHeader({ title, description, actions, onRefresh }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

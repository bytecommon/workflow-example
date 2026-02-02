import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useToast } from '@/hooks/useToast'

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateTemplateDialog({ open, onOpenChange, onSubmit }: CreateTemplateDialogProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    templateKey: '',
    templateName: '',
    templateDesc: '',
    category: '',
    icon: '',
    sortOrder: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.templateKey.trim()) {
      toast.error('模板关键字不能为空')
      return
    }

    if (!formData.templateName.trim()) {
      toast.error('模板名称不能为空')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      templateKey: '',
      templateName: '',
      templateDesc: '',
      category: '',
      icon: '',
      sortOrder: 0
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新建流程模板</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateKey">模板关键字 *</Label>
              <Input
                id="templateKey"
                value={formData.templateKey}
                onChange={(e) => setFormData({ ...formData, templateKey: e.target.value })}
                placeholder="如：simple_approve"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateName">模板名称 *</Label>
              <Input
                id="templateName"
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                placeholder="如：简单审批流程"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateDesc">模板描述</Label>
            <Textarea
              id="templateDesc"
              value={formData.templateDesc}
              onChange={(e) => setFormData({ ...formData, templateDesc: e.target.value })}
              placeholder="请输入模板的详细描述"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="通用">通用</SelectItem>
                  <SelectItem value="人事管理">人事管理</SelectItem>
                  <SelectItem value="财务管理">财务管理</SelectItem>
                  <SelectItem value="行政管理">行政管理</SelectItem>
                  <SelectItem value="采购管理">采购管理</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">图标</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="如：check-circle, layers, arrow-right"
            />
            <p className="text-sm text-muted-foreground">
              支持的图标：check-circle, layers, arrow-right, git-branch, git-commit 等
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

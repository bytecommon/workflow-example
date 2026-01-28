import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface CreateWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateWorkflowDialog({ open, onOpenChange, onSubmit }: CreateWorkflowDialogProps) {
  const [formData, setFormData] = useState({
    workflowName: '',
    workflowKey: '',
    workflowDesc: '',
    category: '',
    formId: undefined as number | undefined,
    icon: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.workflowName && formData.workflowKey) {
      // 转换数据格式以匹配后端 DTO
      const submitData = {
        workflowName: formData.workflowName,
        workflowKey: formData.workflowKey,
        workflowDesc: formData.workflowDesc,
        category: formData.category,
        formId: formData.formId,
        icon: formData.icon
      }
      onSubmit(submitData)
      setFormData({ 
        workflowName: '', 
        workflowKey: '', 
        workflowDesc: '', 
        category: '', 
        formId: undefined, 
        icon: '' 
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新建流程定义</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workflowName">流程名称</Label>
            <Input
              id="workflowName"
              placeholder="请输入流程名称"
              value={formData.workflowName}
              onChange={(e) => handleChange('workflowName', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workflowKey">流程关键字</Label>
            <Input
              id="workflowKey"
              placeholder="请输入流程关键字（英文大写）"
              value={formData.workflowKey}
              onChange={(e) => handleChange('workflowKey', e.target.value.toUpperCase())}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workflowDesc">流程描述</Label>
            <Textarea
              id="workflowDesc"
              placeholder="请输入流程描述"
              value={formData.workflowDesc}
              onChange={(e) => handleChange('workflowDesc', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">流程分类</Label>
            <Input
              id="category"
              placeholder="请输入流程分类"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icon">图标</Label>
            <Input
              id="icon"
              placeholder="请输入图标名称或URL"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
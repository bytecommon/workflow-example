import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { WorkflowTemplate } from '@/lib/api'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/hooks/useToast'

interface CreateWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateWorkflowDialog({ open, onOpenChange, onSubmit }: CreateWorkflowDialogProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [useTemplate, setUseTemplate] = useState(false)
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(undefined)
  const [formData, setFormData] = useState({
    workflowName: '',
    workflowKey: '',
    workflowDesc: '',
    category: '',
    formId: undefined as number | undefined,
    icon: ''
  })

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await apiService.template.getTemplates({
        pageNum: 1,
        pageSize: 100,
        status: 1 // 只加载已启用的模板
      })
      if (response.code === 200) {
        setTemplates((response.data as any).records || [])
      }
    } catch (error) {
      console.error('加载模板列表失败:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleTemplateChange = async (templateId: string) => {
    const template = templates.find(t => t.id === Number(templateId))
    if (template) {
      setSelectedTemplateId(template.id)
      setFormData({
        workflowName: '',
        workflowKey: '',
        workflowDesc: template.templateDesc || '',
        category: template.category || '',
        formId: undefined,
        icon: template.icon || ''
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workflowName.trim()) {
      toast.error('流程名称不能为空')
      return
    }

    if (!formData.workflowKey.trim()) {
      toast.error('流程关键字不能为空')
      return
    }

    setLoading(true)
    try {
      if (useTemplate && selectedTemplateId) {
        // 基于模板创建流程定义
        const response = await apiService.template.createDefinitionFromTemplate(
          selectedTemplateId,
          {
            workflowName: formData.workflowName,
            workflowKey: formData.workflowKey
          }
        )

        if (response.code === 200) {
          toast.success('基于模板创建流程成功')
          onSubmit({
            id: response.data,
            ...formData
          })
          resetForm()
        } else {
          toast.error(`创建流程失败: ${response.message}`)
        }
      } else {
        // 直接创建流程定义
        const submitData = {
          workflowName: formData.workflowName,
          workflowKey: formData.workflowKey,
          workflowDesc: formData.workflowDesc,
          category: formData.category,
          formId: formData.formId,
          icon: formData.icon
        }
        onSubmit(submitData)
        resetForm()
      }
    } catch (error) {
      console.error('创建流程失败:', error)
      toast.error('创建流程失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setUseTemplate(false)
    setSelectedTemplateId(undefined)
    setFormData({
      workflowName: '',
      workflowKey: '',
      workflowDesc: '',
      category: '',
      formId: undefined,
      icon: ''
    })
    onOpenChange(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建流程定义</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 选择创建方式 */}
          <div className="space-y-2">
            <Label>创建方式</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="createMode"
                  checked={!useTemplate}
                  onChange={(e) => setUseTemplate(!e.target.checked)}
                  className="w-4 h-4"
                />
                <span>直接创建</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="createMode"
                  checked={useTemplate}
                  onChange={(e) => setUseTemplate(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>基于模板创建</span>
              </label>
            </div>
          </div>

          {/* 选择模板 */}
          {useTemplate && (
            <div className="space-y-2">
              <Label htmlFor="template">选择模板</Label>
              <Select
                value={selectedTemplateId?.toString() || ''}
                onValueChange={handleTemplateChange}
                disabled={loadingTemplates}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTemplates ? '加载中...' : '请选择模板'} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.templateName} ({template.templateKey})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplateId && (
                <p className="text-sm text-muted-foreground">
                  将复制模板的节点和连线结构，无需手动配置
                </p>
              )}
            </div>
          )}

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
            <Button type="button" variant="outline" onClick={resetForm}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : useTemplate ? '基于模板创建' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

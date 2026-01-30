import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { workflowService, instanceService, formService } from '@/lib/apiService'
import { WorkflowDefinition, WorkflowDetailVO, FormDefinition, FormField } from '@/lib/api'
import { Loader2, Info, CheckCircle2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface StartWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  currentUser?: any
}

export function StartWorkflowDialog({ open, onOpenChange, onSubmit, currentUser }: StartWorkflowDialogProps) {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('')
  const [workflowDetail, setWorkflowDetail] = useState<WorkflowDetailVO | null>(null)
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingForm, setLoadingForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  // 加载已发布的流程列表
  useEffect(() => {
    if (open) {
      loadWorkflows()
      // 重置状态
      setSelectedWorkflowId('')
      setWorkflowDetail(null)
      setFormDefinition(null)
      setFormData({})
      setTitle('')
    }
  }, [open])

  // 当选择流程改变时，加载详情和表单
  useEffect(() => {
    if (selectedWorkflowId) {
      loadWorkflowDetail(parseInt(selectedWorkflowId))
    }
  }, [selectedWorkflowId])

  const loadWorkflows = async () => {
    setLoading(true)
    try {
      const response = await workflowService.getDefinitions({
        status: 1, // 只获取已发布的
        pageNum: 1,
        pageSize: 100
      })
      if (response.code === 200) {
        const workflows = Array.isArray(response.data) ? response.data : response.data.records || []
        setWorkflows(workflows)
      }
    } catch (error) {
      console.error('获取流程列表失败:', error)
      showError('获取流程列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadWorkflowDetail = async (id: number) => {
    setLoadingDetail(true)
    try {
      const response = await workflowService.getWorkflowDetail(id)
      if (response.code === 200 && response.data) {
        setWorkflowDetail(response.data)
        setTitle(`${response.data.workflowName}-${new Date().toLocaleDateString()}`)

        // 如果有表单ID，加载表单详情
        if (response.data.formId) {
          await loadFormDetail(response.data.formId)
        }
      }
    } catch (error) {
      console.error('获取工作流详情失败:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const loadFormDetail = async (formId: number) => {
    setLoadingForm(true)
    try {
      if (!formService) {
        throw new Error('formService 未定义，请检查 apiService 导出')
      }
      const response = await formService.getFormDetail(formId)
      if (response.code === 200 && response.data) {
        // 处理表单数据：如果 formConfig 是字符串，则解析为对象
        let formConfig = response.data
        if (response.data.formConfig && typeof response.data.formConfig === 'string') {
          try {
            const parsedConfig = JSON.parse(response.data.formConfig)
            formConfig = {
              ...response.data,
              ...parsedConfig
            }
          } catch (parseError) {
            console.error('解析 formConfig 失败:', parseError)
          }
        }
        
        setFormDefinition(formConfig)
        
        // 初始化表单字段值
        const initialValues: Record<string, any> = {}
        if (formConfig.fields && Array.isArray(formConfig.fields)) {
          formConfig.fields.forEach((field: any) => {
            if (field.defaultValue !== undefined) {
              initialValues[field.name] = field.defaultValue
            } else if (field.type === 'checkbox') {
              initialValues[field.name] = false
            } else if (field.type === 'number') {
              initialValues[field.name] = 0
            } else {
              initialValues[field.name] = ''
            }
          })
        }
        setFormData(initialValues)
      }
    } catch (error) {
      console.error('获取表单详情失败:', error)
      showError(error instanceof Error ? error.message : '请检查网络连接')
    } finally {
      setLoadingForm(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!selectedWorkflowId || !currentUser?.id) return

    setSubmitting(true)
    try {
      const submitData = {
        workflowId: parseInt(selectedWorkflowId),
        startUserId: currentUser.id,
        startUserName: currentUser.name,
        title: title,
        formData: JSON.stringify(formData),
        priority: 0
      }

      const response = await instanceService.startInstance(submitData)
      if (response.code === 200) {
      showSuccess('流程实例已成功发起')
        onSubmit(response.data)
        onOpenChange(false)
      } else {
      showError(response.message)
      }
    } catch (error) {
      console.error('启动流程失败:', error)
      showError('请检查网络连接或表单数据')
    } finally {
      setSubmitting(false)
    }
  }

  const renderFormField = (field: FormField) => {
    const value = formData[field.name]

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        )
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Select
              value={value || ''}
              onValueChange={(val: string) => handleInputChange(field.name, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || '请选择'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt: any) => {
                  const label = typeof opt === 'string' ? opt : opt.label
                  const val = typeof opt === 'string' ? opt : opt.value || opt.label
                  return (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )
      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
            />
            <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
          </div>
        )
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder}
              value={value === undefined ? '' : value}
              onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
            />
          </div>
        )
      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={field.name}
              type="date"
              value={value || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        )
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={field.name}
              type="text"
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            发起新流程
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 选择流程 */}
          <div className="space-y-2">
            <Label>选择工作流</Label>
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? '加载中...' : '请选择要发起的工作流'} />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((wf) => (
                  <SelectItem key={wf.id} value={wf.id.toString()}>
                    {wf.workflowName} (v{wf.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWorkflowId && (
            <>
              {/* 流程基本信息 */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">流程信息</div>
                  {loadingDetail && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {workflowDetail && (
                    <Badge variant="outline">{workflowDetail.category || '默认分类'}</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instance-title">流程标题</Label>
                  <Input
                    id="instance-title"
                    placeholder="请输入流程标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* 动态表单内容 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">表单数据</Label>
                  {loadingForm && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {formDefinition ? (
                  <div className="grid grid-cols-1 gap-4 border p-4 rounded-lg bg-card">
                    {formDefinition.fields && formDefinition.fields.length > 0 ? (
                      formDefinition.fields.map(renderFormField)
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        该流程未配置表单字段
                      </div>
                    )}
                  </div>
                ) : !loadingForm && (
                  <div className="flex items-center gap-2 p-4 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                    <Info className="h-4 w-4" />
                    未找到关联表单或表单正在加载中...
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedWorkflowId || submitting || loadingForm}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                立即发起
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { apiService } from '@/lib/apiService'
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
  const toast = useToast()
  const [formData, setFormData] = useState({
    definitionId: 0,
    priority: 0,
    formValues: {} as Record<string, any>
  })
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([])
  const [workflowDetail, setWorkflowDetail] = useState<WorkflowDetailVO | null>(null)
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingForm, setLoadingForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      loadDefinitions()
    }
  }, [open])

  useEffect(() => {
    console.log('definitionId变化:', formData.definitionId)
    if (formData.definitionId > 0) {
      loadWorkflowDetail(formData.definitionId)
    } else {
      setWorkflowDetail(null)
      setFormDefinition(null)
      setFormData(prev => ({ ...prev, formValues: {} }))
    }
  }, [formData.definitionId])

  const loadDefinitions = async () => {
    setLoading(true)
    try {
      const response = await apiService.workflow.getDefinitions({
        pageNum: 1,
        pageSize: 100,
        status: 1 // 只获取已启用的流程
      })

      if (response.code === 200 && Array.isArray(response.data)) {
        setDefinitions(response.data)
      } else if (response.code === 200 && Array.isArray(response.data.records)) {
        setDefinitions(response.data.records)
      }
    } catch (error) {
      console.error('获取流程定义失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkflowDetail = async (definitionId: number) => {
    console.log('开始加载工作流详情, definitionId:', definitionId)
    setLoadingDetail(true)
    try {
      const response = await apiService.workflow.getWorkflowDetail(definitionId)
      console.log('工作流详情响应:', response)
      if (response.code === 200 && response.data) {
        console.log('设置工作流详情:', response.data)
        setWorkflowDetail(response.data)

        // 如果有表单ID，加载表单详情
        if (response.data.formId) {
          console.log('工作流有表单ID, formId:', response.data.formId)
          await loadFormDetail(response.data.formId)
        } else {
          console.log('工作流没有表单ID')
        }
      } else {
        console.warn('工作流详情响应异常, code:', response.code)
      }
    } catch (error) {
      console.error('获取工作流详情失败:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  const loadFormDetail = async (formId: number) => {
    console.log('开始加载表单详情, formId:', formId)
    setLoadingForm(true)
    try {
      console.log('apiService 状态:', {
        hasApiService: !!apiService,
        hasForm: !!apiService?.form,
        hasGetFormDetail: !!apiService?.form?.getFormDetail
      })
      if (!apiService?.form) {
        throw new Error('apiService.form 未定义')
      }
      const response = await apiService.form.getFormDetail(formId)
      console.log('表单详情响应:', response)
      if (response.code === 200 && response.data) {
        console.log('设置表单定义:', response.data)
        setFormDefinition(response.data)
        // 初始化表单字段值
        const initialValues: Record<string, any> = {}
        if (response.data.fields) {
          console.log('表单字段数量:', response.data.fields.length)
          console.log('表单字段详情:', response.data.fields)
          response.data.fields.forEach(field => {
            if (field.defaultValue !== undefined) {
              initialValues[field.name] = field.defaultValue
            } else if (field.type === 'checkbox') {
              initialValues[field.name] = false
            }
          })
          console.log('初始表单值:', initialValues)
        } else {
          console.warn('表单没有fields字段')
        }
        setFormData(prev => ({ ...prev, formValues: initialValues }))
      } else {
        console.warn('表单响应异常, code:', response.code, 'data:', response.data)
      }
    } catch (error) {
      console.error('获取表单详情失败:', error)
    } finally {
      setLoadingForm(false)
    }
  }

  const validateForm = (): { valid: boolean; message: string } => {
    if (!formDefinition || !formDefinition.fields) {
      return { valid: true, message: '' }
    }

    const formValues = formData.formValues

    // 1. 必填字段验证
    for (const field of formDefinition.fields) {
      if (field.required && !formValues[field.name]) {
        return { valid: false, message: `请填写${field.label}` }
      }
    }

    // 2. 数值字段验证（不能小于等于0）
    const numberFields = formDefinition.fields.filter(f => f.type === 'number')
    for (const field of numberFields) {
      const value = formValues[field.name]
      if (value !== undefined && value !== null && value !== '') {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          return { valid: false, message: `${field.label}必须是有效的数字` }
        }
        if (numValue <= 0) {
          return { valid: false, message: `${field.label}必须大于0` }
        }
      }
    }

    // 3. 日期范围验证（开始日期不能大于结束日期）
    const startDateFields = formDefinition.fields.filter(f =>
      f.type === 'date' && (f.name.toLowerCase().includes('start') || f.label.includes('开始'))
    )
    const endDateFields = formDefinition.fields.filter(f =>
      f.type === 'date' && (f.name.toLowerCase().includes('end') || f.label.includes('结束'))
    )

    for (const startField of startDateFields) {
      const startDate = formValues[startField.name]
      if (!startDate) continue

      for (const endField of endDateFields) {
        const endDate = formValues[endField.name]
        if (!endDate) continue

        if (new Date(startDate) > new Date(endDate)) {
          return {
            valid: false,
            message: `${startField.label}不能晚于${endField.label}`
          }
        }
      }
    }

    return { valid: true, message: '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.definitionId) {
      toast.warning('请选择流程类型')
      return
    }

    // 验证表单
    const validation = validateForm()
    if (!validation.valid) {
      toast.warning(validation.message)
      return
    }

    setSubmitting(true)
    try {
      const selectedDefinition = definitions.find(d => d.id === formData.definitionId)
      const submitData = {
        workflowId: formData.definitionId, // 后端期望的是 workflowId，不是 definitionId
        startUserId: currentUser?.id, // 后端期望的是 startUserId，不是 starterUserId
        startUserName: currentUser?.name, // 后端期望的是 startUserName，不是 starterUserName
        title: `${selectedDefinition?.workflowName || '流程'}-${currentUser?.name || '用户'}`, // 固定标题格式
        priority: formData.priority,
        formData: JSON.stringify(formData.formValues) // 后端期望的是 formData（JSON字符串），不是 variables
      }

      console.log('提交工作流数据:', submitData) // 添加调试日志
      await onSubmit(submitData)

      // 重置表单
    setFormData({
      definitionId: 0,
      priority: 0,
      formValues: {}
    })
    setWorkflowDetail(null)
    setFormDefinition(null)
    setFieldErrors({})

      onOpenChange(false)
    } catch (error) {
      console.error('提交申请失败:', error)
      toast.error('提交申请失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field === 'definitionId' || field === 'priority') {
      // 直接更新 formData 的顶层字段
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      // 清除该字段的错误信息
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })

      // 更新表单字段值
      setFormData(prev => ({
        ...prev,
        formValues: {
          ...prev.formValues,
          [field]: value
        }
      }))

      // 实时验证数值字段
      if (formDefinition && formDefinition.fields) {
        const formField = formDefinition.fields.find(f => f.name === field)
        if (formField && formField.type === 'number') {
          const numValue = Number(value)
          if (value !== '' && value !== undefined && value !== null && !isNaN(numValue)) {
            // 验证必须大于0
            if (numValue <= 0) {
              setFieldErrors(prev => ({
                ...prev,
                [field]: `${formField.label}必须大于0`
              }))
            }
          }
        }
      }
    }
  }

  const selectedDefinition = definitions.find(d => d.id === formData.definitionId)

  // 渲染表单字段
  const renderFormField = (field: FormField) => {
    const value = formData.formValues[field.name]

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.name}
              placeholder={field.placeholder || `请输入${field.label}`}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <Textarea
              id={field.name}
              placeholder={field.placeholder || `请输入${field.label}`}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={3}
              required={field.required}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder || `请输入${field.label}`}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              min="0"
              step="any"
              required={field.required}
              className={fieldErrors[field.name] ? 'border-red-500' : ''}
            />
            {fieldErrors[field.name] && (
              <p className="text-sm text-red-500">{fieldErrors[field.name]}</p>
            )}
          </div>
        )

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <Input
              id={field.name}
              type="date"
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              className={fieldErrors[field.name] ? 'border-red-500' : ''}
            />
            {fieldErrors[field.name] && (
              <p className="text-sm text-red-500">{fieldErrors[field.name]}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
            <Select
              value={value || ''}
              onValueChange={(value) => handleChange(field.name, value)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={field.placeholder || `请选择${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => {
                  // 兼容两种格式：对象数组或字符串数组
                  const isObject = typeof option === 'object' && option !== null
                  const label = isObject ? (option as FormFieldOption).label : (option as string)
                  const value = isObject ? (option as FormFieldOption).value : (option as string)

                  return (
                    <SelectItem key={`${value || option}-${index}`} value={value || (option as string)}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value === 'true' || value === true}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <Label htmlFor={field.name} className="flex-1 cursor-pointer">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <DialogTitle>发起新流程</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 选择流程类型 */}
          <div className="space-y-2">
            <Label htmlFor="definitionId">选择流程类型 *</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={formData.definitionId > 0 ? String(formData.definitionId) : ''}
                onValueChange={(value) => handleChange('definitionId', Number(value))}
              >
                <SelectTrigger id="definitionId">
                  <SelectValue placeholder="请选择流程类型" />
                </SelectTrigger>
                <SelectContent>
                  {definitions.map((def) => (
                    <SelectItem key={def.id} value={String(def.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{def.workflowName}</span>
                        {def.workflowDesc && (
                          <span className="text-xs text-muted-foreground mt-1">{def.workflowDesc}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 加载流程详情中 */}
          {loadingDetail && (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">加载流程详情中...</span>
            </div>
          )}

          {/* 显示工作流详情和表单 */}
          {workflowDetail && !loadingDetail && (
            <>
              {/* 流程信息卡片 */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="font-medium">流程信息</span>
                </div>

                {workflowDetail.workflowDesc && (
                  <div className="text-sm">
                    <span className="font-medium">描述：</span>
                    <span className="text-muted-foreground">{workflowDetail.workflowDesc}</span>
                  </div>
                )}

                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-medium">版本：</span>
                    <span className="text-muted-foreground">v{workflowDetail.version}</span>
                  </div>
                  {workflowDetail.category && (
                    <div>
                      <span className="font-medium">分类：</span>
                      <Badge variant="secondary">{workflowDetail.category}</Badge>
                    </div>
                  )}
                </div>

                {workflowDetail.statistics && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-2 bg-background rounded-lg">
                      <div className="text-lg font-bold text-primary">{workflowDetail.statistics.totalInstances}</div>
                      <div className="text-xs text-muted-foreground">总实例</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{workflowDetail.statistics.runningInstances}</div>
                      <div className="text-xs text-muted-foreground">运行中</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded-lg">
                      <div className="text-lg font-bold text-green-600">{workflowDetail.statistics.completedInstances}</div>
                      <div className="text-xs text-muted-foreground">已完成</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 动态表单 */}
              {loadingForm ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">加载表单中...</span>
                </div>
              ) : formDefinition ? (
                (() => {
                  console.log('渲染表单区域, formDefinition:', formDefinition)
                  console.log('fields是否存在:', !!formDefinition.fields)
                  console.log('fields长度:', formDefinition.fields?.length || 0)
                  return formDefinition.fields && formDefinition.fields.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{formDefinition.formName}</h3>
                      </div>
                      {formDefinition.formDesc && (
                        <p className="text-sm text-muted-foreground">{formDefinition.formDesc}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formDefinition.fields
                          .sort((a, b) => a.sort - b.sort)
                          .map(field => renderFormField(field))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      此流程无需填写表单
                    </div>
                  )
                })()
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  无表单定义
                </div>
              )}

              {/* 优先级选择 */}
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={String(formData.priority)}
                  onValueChange={(value) => handleChange('priority', Number(value))}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="请选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">普通</SelectItem>
                    <SelectItem value="1">紧急</SelectItem>
                    <SelectItem value="2">特急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          </div>

          <DialogFooter className="flex-shrink-0 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              提交申请
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

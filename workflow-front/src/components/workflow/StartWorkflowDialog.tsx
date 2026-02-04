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
  const toast = useToast()
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [titleError, setTitleError] = useState('')

  // 表单字段提示映射
  const getFieldPlaceholder = (field: FormField): string => {
    // 如果字段已有 placeholder，优先使用
    if (field.placeholder && field.placeholder.trim() !== '') {
      return field.placeholder
    }

    // 根据字段标签匹配预设的提示
    const label = field.label || field.name || ''

    // 常见字段的默认提示
    const placeholderMap: Record<string, string> = {
      '请假类型': '请选择：病假、事假、年假、调休',
      '请假天数': '请输入请假天数，如：3',
      '开始日期': '请选择开始日期',
      '结束日期': '请选择结束日期',
      '请假原因': '请详细说明请假原因',
      '理由': '请填写申请理由',
      '原因': '请填写申请原因',
      '物品名称': '请输入物品名称，如：办公桌椅',
      '数量': '请输入数量',
      '金额': '请输入金额（元），如：5000',
      '供应商': '请输入供应商名称',
      '预算': '请输入预算金额',
      '费用类型': '请选择：差旅费、招待费、办公费等',
      '费用说明': '请详细说明费用用途',
      '报销金额': '请输入报销金额（元）',
      '费用日期': '请选择费用发生日期',
      '出差类型': '请选择：国内出差、国外出差',
      '出差地点': '请输入出差目的地，如：北京',
      '出差天数': '请输入出差天数',
      '印章类型': '请选择：公章、合同章、财务章、法人章',
      '文件名称': '请输入文件名称',
      '文件份数': '请输入文件份数',
      '用印事由': '请详细说明用印事由',
      '申请标题': '请输入申请标题',
      '申请内容': '请详细描述申请内容',
      '备注': '请填写备注信息（可选）',
      '说明': '请填写说明信息',
      '标题': '请输入标题',
      '描述': '请输入描述内容'
    }

    // 完全匹配
    if (placeholderMap[label]) {
      return placeholderMap[label]
    }

    // 部分匹配
    for (const key in placeholderMap) {
      if (label.includes(key)) {
        return placeholderMap[key]
      }
    }

    // 根据字段类型生成默认提示
    switch (field.type) {
      case 'text':
        return `请输入${field.label || field.name}`
      case 'number':
        return `请输入${field.label || field.name}（数字）`
      case 'date':
        return `请选择${field.label || field.name}`
      case 'select':
        return '请选择'
      case 'textarea':
        return `请详细说明${field.label || field.name}`
      default:
        return `请输入${field.label || field.name}`
    }
  }

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
      setFormErrors({})
      setTitleError('')
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
      toast.error('获取流程列表失败')
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
      toast.error(error instanceof Error ? error.message : '请检查网络连接')
    } finally {
      setLoadingForm(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除该字段的错误
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    if (!formDefinition?.fields) return true

    const errors: Record<string, string> = {}
    let isValid = true

    formDefinition.fields.forEach((field: FormField) => {
      // 必填项验证
      if (field.required) {
        const value = formData[field.name]

        // 检查是否为空
        if (value === undefined || value === null || value === '') {
          errors[field.name] = `${field.label}不能为空`
          isValid = false
          return
        }

        // 根据类型进行额外验证
        if (field.type === 'number') {
          if (isNaN(Number(value)) || Number(value) === 0) {
            errors[field.name] = `${field.label}必须是有效的数字且大于0`
            isValid = false
          }
        }

        if (field.type === 'date') {
          const dateValue = new Date(value)
          if (!value || isNaN(dateValue.getTime()) || dateValue.toString() === 'Invalid Date') {
            errors[field.name] = `${field.label}必须是有效的日期`
            isValid = false
          }
        }

        if (field.type === 'select') {
          if (!value || value === '') {
            errors[field.name] = `请选择${field.label}`
            isValid = false
          }
        }

        if (field.type === 'textarea') {
          if (!value || typeof value !== 'string' || value.trim() === '') {
            errors[field.name] = `${field.label}不能为空`
            isValid = false
          }
        }

        if (field.type === 'text') {
          if (!value || typeof value !== 'string' || value.trim() === '') {
            errors[field.name] = `${field.label}不能为空`
            isValid = false
          }
        }
      }

      // 数字范围验证（即使不是必填也要验证）
      if (field.type === 'number' && formData[field.name] !== undefined && field.validation) {
        const value = Number(formData[field.name])
        if (!isNaN(value)) {
          if (field.validation.min !== undefined && value < field.validation.min) {
            errors[field.name] = `${field.label}不能小于${field.validation.min}`
            isValid = false
          }
          if (field.validation.max !== undefined && value > field.validation.max) {
            errors[field.name] = `${field.label}不能大于${field.validation.max}`
            isValid = false
          }
        }
      }
    })

    // 设置错误状态
    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!selectedWorkflowId || !currentUser?.id) return

    // 验证流程标题
    if (!title || title.trim() === '') {
      setTitleError('请输入流程标题')
      toast.error('请输入流程标题')
      return
    } else {
      setTitleError('')
    }

    // 验证表单
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0]
      toast.error(firstError || '请填写所有必填项')
      return
    }

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
        toast.success('流程实例已成功发起')
        onSubmit(response.data)
        onOpenChange(false)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('启动流程失败:', error)
      toast.error('请检查网络连接或表单数据')
    } finally {
      setSubmitting(false)
    }
  }

  const renderFormField = (field: FormField) => {
    const value = formData[field.name]
    const error = formErrors[field.name]
    const placeholder = getFieldPlaceholder(field)  // 使用智能提示

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Textarea
              id={field.name}
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={error ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
              <SelectTrigger className={error ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder={placeholder} />
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
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
            {error && <p className="text-sm text-red-500 ml-4">{error}</p>}
          </div>
        )
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={field.name}
              type="number"
              placeholder={placeholder}
              value={value === undefined ? '' : value}
              onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
              className={error ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )
      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={field.name}
              type="date"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={error ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={field.name}
              type="text"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={error ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* 固定的标题部分 */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            发起新流程
          </DialogTitle>
        </DialogHeader>

        {/* 可滚动的内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
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
                  <Label htmlFor="instance-title">流程标题 <span className="text-red-500">*</span></Label>
                  <Input
                    id="instance-title"
                    placeholder="请输入流程标题"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      setTitleError('')
                    }}
                    className={titleError ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {titleError && <p className="text-sm text-red-500 mt-1">{titleError}</p>}
                </div>
              </div>

              {/* 动态表单内容 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">表单数据</Label>
                  {loadingForm && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {formDefinition ? (
                  <div className="border p-4 rounded-lg bg-card">
                    {formDefinition.fields && formDefinition.fields.length > 0 ? (
                      <>
                        {/* 非文本域字段：1行2列布局 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {formDefinition.fields
                            .filter((field: FormField) => field.type !== 'textarea')
                            .map(renderFormField)}
                        </div>
                        {/* 文本域字段：1行1列布局 */}
                        <div className="space-y-4">
                          {formDefinition.fields
                            .filter((field: FormField) => field.type === 'textarea')
                            .map(renderFormField)}
                        </div>
                      </>
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
      </div>

      {/* 固定的底部按钮 */}
      <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-0">
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

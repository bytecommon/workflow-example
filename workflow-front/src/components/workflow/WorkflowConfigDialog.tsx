import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Key
} from 'lucide-react'
import { WorkflowDefinition } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { apiService } from '@/lib/apiService'

interface WorkflowConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow: WorkflowDefinition | null
  onSave: (config: any) => void
}

interface ApprovalRule {
  id?: number
  nodeId: string
  nodeName: string
  ruleType: 'single' | 'multi' | 'sequential' | 'parallel'
  approvers: string[]
  minApprovals?: number
  timeout?: number
  conditions?: any
}

interface FormField {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date'
  required: boolean
  options?: string[]
  placeholder?: string
}

export function WorkflowConfigDialog({
  open,
  onOpenChange,
  workflow,
  onSave
}: WorkflowConfigDialogProps) {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('form')
  const [loading, setLoading] = useState(false)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([])
  const [formConfig, setFormConfig] = useState({
    title: '',
    description: '',
    submitText: '提交'
  })

  useEffect(() => {
    if (workflow && open) {
      loadWorkflowConfig()
    }
  }, [workflow, open])

  const loadWorkflowConfig = async () => {
    if (!workflow) return
    
    setLoading(true)
    try {
      // 模拟加载配置数据
      const mockFormFields: FormField[] = [
        {
          id: 'title',
          name: '标题',
          type: 'text',
          required: true,
          placeholder: '请输入标题'
        },
        {
          id: 'description',
          name: '描述',
          type: 'textarea',
          required: false,
          placeholder: '请输入详细描述'
        },
        {
          id: 'priority',
          name: '优先级',
          type: 'select',
          required: true,
          options: ['低', '中', '高']
        }
      ]

      const mockApprovalRules: ApprovalRule[] = [
        {
          nodeId: 'approval1',
          nodeName: '部门审批',
          ruleType: 'single',
          approvers: ['部门经理'],
          timeout: 24
        },
        {
          nodeId: 'approval2',
          nodeName: '最终审批',
          ruleType: 'multi',
          approvers: ['总经理', '副总经理'],
          minApprovals: 1,
          timeout: 48
        }
      ]

      setFormFields(mockFormFields)
      setApprovalRules(mockApprovalRules)
      setFormConfig({
        title: `${workflow.workflowName} 申请表单`,
        description: `请填写${workflow.workflowName}相关信息`,
        submitText: '提交申请'
      })
    } catch (error) {
      console.error('加载配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: '新字段',
      type: 'text',
      required: false
    }
    setFormFields([...formFields, newField])
  }

  const handleRemoveFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index))
  }

  const handleUpdateFormField = (index: number, field: Partial<FormField>) => {
    const updated = [...formFields]
    updated[index] = { ...updated[index], ...field }
    setFormFields(updated)
  }

  const handleAddApprovalRule = () => {
    const newRule: ApprovalRule = {
      nodeId: `node_${Date.now()}`,
      nodeName: '新审批节点',
      ruleType: 'single',
      approvers: []
    }
    setApprovalRules([...approvalRules, newRule])
  }

  const handleRemoveApprovalRule = (index: number) => {
    setApprovalRules(approvalRules.filter((_, i) => i !== index))
  }

  const handleUpdateApprovalRule = (index: number, rule: Partial<ApprovalRule>) => {
    const updated = [...approvalRules]
    updated[index] = { ...updated[index], ...rule }
    setApprovalRules(updated)
  }

  const handleSave = async () => {
    if (!workflow) return
    
    setLoading(true)
    try {
      const config = {
        formSchema: {
          config: formConfig,
          fields: formFields
        },
        approvalRules
      }

      const response = await apiService.workflow.saveConfig(workflow.id, config)
      if (response.code === 200) {
        onSave(config)
        onOpenChange(false)
      } else {
        toast.error(`保存配置失败: ${response.message}`)
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error('保存配置失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'single': return <CheckCircle className="w-4 h-4" />
      case 'multi': return <Users className="w-4 h-4" />
      case 'sequential': return <Clock className="w-4 h-4" />
      case 'parallel': return <Key className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const getRuleTypeText = (type: string) => {
    switch (type) {
      case 'single': return '单人审批'
      case 'multi': return '多人审批'
      case 'sequential': return '顺序审批'
      case 'parallel': return '并行审批'
      default: return type
    }
  }

  if (!workflow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>流程配置 - {workflow.workflowName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="form">表单配置</TabsTrigger>
              <TabsTrigger value="approval">审批规则</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">表单基础配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="formTitle">表单标题</Label>
                      <Input
                        id="formTitle"
                        value={formConfig.title}
                        onChange={(e) => setFormConfig({...formConfig, title: e.target.value})}
                        placeholder="请输入表单标题"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="submitText">提交按钮文本</Label>
                      <Input
                        id="submitText"
                        value={formConfig.submitText}
                        onChange={(e) => setFormConfig({...formConfig, submitText: e.target.value})}
                        placeholder="请输入提交按钮文本"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formDescription">表单描述</Label>
                    <Textarea
                      id="formDescription"
                      value={formConfig.description}
                      onChange={(e) => setFormConfig({...formConfig, description: e.target.value})}
                      placeholder="请输入表单描述"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">表单字段配置</CardTitle>
                    <Button onClick={handleAddFormField} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      添加字段
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无字段配置
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={field.required ? "default" : "outline"}>
                                {field.required ? '必填' : '选填'}
                              </Badge>
                              <span className="font-medium">{field.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFormField(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>字段名称</Label>
                              <Input
                                value={field.name}
                                onChange={(e) => handleUpdateFormField(index, { name: e.target.value })}
                                placeholder="字段名称"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>字段类型</Label>
                              <select
                                value={field.type}
                                onChange={(e) => handleUpdateFormField(index, { type: e.target.value as any })}
                                className="w-full p-2 border rounded"
                              >
                                <option value="text">文本</option>
                                <option value="number">数字</option>
                                <option value="select">下拉选择</option>
                                <option value="textarea">多行文本</option>
                                <option value="date">日期</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>占位符文本</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => handleUpdateFormField(index, { placeholder: e.target.value })}
                              placeholder="占位符文本"
                            />
                          </div>

                          {field.type === 'select' && (
                            <div className="space-y-2">
                              <Label>选项（每行一个）</Label>
                              <Textarea
                                value={field.options?.join('\n') || ''}
                                onChange={(e) => handleUpdateFormField(index, {
                                  options: e.target.value.split('\n').filter(Boolean)
                                })}
                                placeholder="请输入选项，每行一个"
                                rows={3}
                              />
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`required-${field.id}`}
                              checked={field.required}
                              onChange={(e) => handleUpdateFormField(index, { required: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor={`required-${field.id}`}>必填字段</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approval" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">审批规则配置</CardTitle>
                    <Button onClick={handleAddApprovalRule} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      添加规则
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {approvalRules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无审批规则
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvalRules.map((rule, index) => (
                        <div key={rule.nodeId} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getRuleTypeIcon(rule.ruleType)}
                              <span className="font-medium">{rule.nodeName}</span>
                              <Badge variant="outline">
                                {getRuleTypeText(rule.ruleType)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveApprovalRule(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>节点名称</Label>
                              <Input
                                value={rule.nodeName}
                                onChange={(e) => handleUpdateApprovalRule(index, { nodeName: e.target.value })}
                                placeholder="审批节点名称"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>审批类型</Label>
                              <select
                                value={rule.ruleType}
                                onChange={(e) => handleUpdateApprovalRule(index, { ruleType: e.target.value as any })}
                                className="w-full p-2 border rounded"
                              >
                                <option value="single">单人审批</option>
                                <option value="multi">多人审批</option>
                                <option value="sequential">顺序审批</option>
                                <option value="parallel">并行审批</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>审批人（每行一个）</Label>
                            <Textarea
                              value={rule.approvers.join('\n')}
                              onChange={(e) => handleUpdateApprovalRule(index, {
                                approvers: e.target.value.split('\n').filter(Boolean)
                              })}
                              placeholder="请输入审批人，每行一个"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>审批超时（小时）</Label>
                              <Input
                                type="number"
                                value={rule.timeout || ''}
                                onChange={(e) => handleUpdateApprovalRule(index, { timeout: Number(e.target.value) })}
                                placeholder="审批超时时间"
                              />
                            </div>
                            {rule.ruleType === 'multi' && (
                              <div className="space-y-2">
                                <Label>最少审批人数</Label>
                                <Input
                                  type="number"
                                  value={rule.minApprovals || ''}
                                  onChange={(e) => handleUpdateApprovalRule(index, { minApprovals: Number(e.target.value) })}
                                  placeholder="最少审批人数"
                                  min={1}
                                  max={rule.approvers.length}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">表单预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 space-y-4 max-w-md mx-auto">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{formConfig.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{formConfig.description}</p>
                    </div>

                    <div className="space-y-4">
                      {formFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-medium">
                            {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.type === 'text' && (
                            <Input placeholder={field.placeholder} />
                          )}
                          {field.type === 'number' && (
                            <Input type="number" placeholder={field.placeholder} />
                          )}
                          {field.type === 'select' && (
                            <select className="w-full p-2 border rounded">
                              <option value="">请选择</option>
                              {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                          {field.type === 'textarea' && (
                            <Textarea placeholder={field.placeholder} rows={3} />
                          )}
                          {field.type === 'date' && (
                            <Input type="date" />
                          )}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full">{formConfig.submitText}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">审批流程预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvalRules.map((rule, index) => (
                      <div key={rule.nodeId} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{rule.nodeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {getRuleTypeText(rule.ruleType)} • {rule.approvers.length}人
                            {rule.timeout && ` • ${rule.timeout}小时超时`}
                          </div>
                        </div>
                        {index < approvalRules.length - 1 && (
                          <div className="text-gray-300">↓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '保存中...' : '保存配置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
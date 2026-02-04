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
import { FlowDesigner } from './flow/FlowDesigner'
import { Node, Edge } from '@xyflow/react'

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
  name: string          // 字段标签（显示名称）
  fieldName?: string     // 字段标识（用于存储）
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
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    if (workflow && open) {
      loadWorkflowConfig()
    } else if (!open) {
      // 关闭对话框时重置状态
      setNodes([])
      setEdges([])
      setActiveTab('form')
    }
  }, [workflow, open])

  const loadWorkflowConfig = async () => {
    if (!workflow) return

    setLoading(true)
    try {
      // 调用后台接口获取流程配置
      const response = await apiService.workflow.getConfig(workflow.id)

      if (response.code === 200 && response.data) {
        const config = response.data

        // 解析表单字段配置
        if (config.formSchema) {
          if (config.formSchema.config) {
            setFormConfig(config.formSchema.config)
          }

          if (config.formSchema.fields && Array.isArray(config.formSchema.fields)) {
            // 转换字段格式以匹配本地 FormField 接口
            const convertedFields: FormField[] = config.formSchema.fields.map((field: any) => ({
              id: field.name || field.fieldName || `field_${Date.now()}`,
              name: field.label || field.name,
              fieldName: field.name,
              type: field.type,
              required: field.required || false,
              options: field.options,
              placeholder: field.placeholder
            }))
            setFormFields(convertedFields)
          }
        }

        // 解析审批规则配置
        if (config.approvalRules && Array.isArray(config.approvalRules)) {
          setApprovalRules(config.approvalRules)
        }

        // 解析节点配置
        if (config.nodes && Array.isArray(config.nodes)) {
          const flowNodes: Node[] = config.nodes.map((node: any) => {
            try {
              return {
                id: node.id || node.nodeKey,
                type: node.nodeType?.toLowerCase() || 'task',
                position: { x: Number(node.positionX) || 0, y: Number(node.positionY) || 0 },
                data: {
                  label: node.nodeName,
                  nodeKey: node.nodeKey,
                  nodeType: node.nodeType?.toLowerCase(),
                  ...JSON.parse(node.config || '{}')
                }
              }
            } catch (error) {
              console.error('解析节点配置失败:', error, node)
              // 如果解析失败，返回一个基本的节点配置
              return {
                id: node.id || node.nodeKey || `node_${Date.now()}`,
                type: node.nodeType?.toLowerCase() || 'task',
                position: { x: 0, y: 0 },
                data: {
                  label: node.nodeName || '未命名节点',
                  nodeKey: node.nodeKey || `node_${Date.now()}`,
                  nodeType: node.nodeType?.toLowerCase() || 'task'
                }
              }
            }
          }).filter(node => node.id && node.position) // 过滤掉无效节点
          setNodes(flowNodes)
        } else {
          // 设置默认节点
          setNodes([
            {
              id: 'start',
              type: 'start',
              position: { x: 100, y: 300 },
              data: { label: '开始', nodeKey: 'start', nodeType: 'start' }
            },
            {
              id: 'approve',
              type: 'approve',
              position: { x: 350, y: 300 },
              data: { label: '审批', nodeKey: 'approve', nodeType: 'approve' }
            },
            {
              id: 'end',
              type: 'end',
              position: { x: 600, y: 300 },
              data: { label: '结束', nodeKey: 'end', nodeType: 'end' }
            }
          ])
        }

        // 解析连线配置
        if (config.edges && Array.isArray(config.edges)) {
          const flowEdges: Edge[] = config.edges
            .filter((edge: any) => edge.sourceNodeKey && edge.targetNodeKey)
            .map((edge: any) => ({
              id: edge.id || `${edge.sourceNodeKey}-${edge.targetNodeKey}`,
              source: edge.sourceNodeKey,
              target: edge.targetNodeKey,
              type: edge.conditionExpr ? 'conditional' : 'default',
              data: {
                condition: edge.conditionExpr,
                priority: edge.priority,
                label: edge.conditionExpr || ''
              }
            }))
          setEdges(flowEdges)
        } else {
          // 设置默认连线
          setEdges([
            { id: 'e1', source: 'start', target: 'approve', type: 'default', data: {} },
            { id: 'e2', source: 'approve', target: 'end', type: 'default', data: {} }
          ])
        }
      } else {
        // 如果没有配置数据，设置默认配置
        setFormConfig({
          title: `${workflow.workflowName} 申请表单`,
          description: `请填写${workflow.workflowName}相关信息`,
          submitText: '提交申请'
        })
        setFormFields([])
        setApprovalRules([])
        setNodes([
          {
            id: 'start',
            type: 'start',
            position: { x: 100, y: 300 },
            data: { label: '开始', nodeKey: 'start', nodeType: 'start' }
          },
          {
            id: 'approve',
            type: 'approve',
            position: { x: 350, y: 300 },
            data: { label: '审批', nodeKey: 'approve', nodeType: 'approve' }
          },
          {
            id: 'end',
            type: 'end',
            position: { x: 600, y: 300 },
            data: { label: '结束', nodeKey: 'end', nodeType: 'end' }
          }
        ])
        setEdges([
          { id: 'e1', source: 'start', target: 'approve', type: 'default', data: {} },
          { id: 'e2', source: 'approve', target: 'end', type: 'default', data: {} }
        ])
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      toast.error('加载配置失败，请稍后重试')
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
      // 验证节点是否有连线
      if (edges.length === 0) {
        toast.error('流程配置错误：至少需要一个连线')
        setLoading(false)
        return
      }

      // 检查每个节点是否至少有一条连线
      const disconnectedNodeIds = nodes.filter(node => {
        const hasIncoming = edges.some(edge => edge.target === node.id)
        const hasOutgoing = edges.some(edge => edge.source === node.id)
        return !hasIncoming && !hasOutgoing
      }).map(node => node.data?.label || node.id)

      if (disconnectedNodeIds.length > 0) {
        toast.error(`以下节点没有连线：${disconnectedNodeIds.join(', ')}`)
        setLoading(false)
        return
      }

      // 验证开始和结束节点
      const startNodes = nodes.filter(node => {
        const type = node.type?.toLowerCase()
        const nodeType = node.data?.nodeType?.toLowerCase()
        return type === 'start' || nodeType === 'start'
      })
      const endNodes = nodes.filter(node => {
        const type = node.type?.toLowerCase()
        const nodeType = node.data?.nodeType?.toLowerCase()
        return type === 'end' || nodeType === 'end'
      })

      if (startNodes.length !== 1) {
        toast.error('流程配置错误：必须恰好有一个开始节点')
        setLoading(false)
        return
      }

      if (endNodes.length !== 1) {
        toast.error('流程配置错误：必须恰好有一个结束节点')
        setLoading(false)
        return
      }

      const startNode = startNodes[0]
      const endNode = endNodes[0]

      // 检查开始节点是否有入边
      const hasIncomingToStart = edges.some(edge => edge.target === startNode.id)
      if (hasIncomingToStart) {
        toast.error('流程配置错误：开始节点不能有入边')
        setLoading(false)
        return
      }

      // 检查结束节点是否有出边
      const hasOutgoingFromEnd = edges.some(edge => edge.source === endNode.id)
      if (hasOutgoingFromEnd) {
        toast.error('流程配置错误：结束节点不能有出边')
        setLoading(false)
        return
      }

      // 检查开始节点是否有出边
      const hasOutgoingFromStart = edges.some(edge => edge.source === startNode.id)
      if (!hasOutgoingFromStart) {
        toast.error('流程配置错误：开始节点必须有出边')
        setLoading(false)
        return
      }

      // 检查结束节点是否有入边
      const hasIncomingToEnd = edges.some(edge => edge.target === endNode.id)
      if (!hasIncomingToEnd) {
        toast.error('流程配置错误：结束节点必须有入边')
        setLoading(false)
        return
      }

      // 转换表单字段，添加 fieldName（字段标识）和 label（字段标签）
      const convertedFields = formFields.map(field => ({
        name: field.name,              // 字段标签（显示名称）
        label: field.name,              // 字段标签（与name相同，用于兼容）
        fieldName: field.fieldName || generateFieldName(field.name),  // 字段标识
        type: field.type,
        required: field.required,
        options: field.options,
        placeholder: field.placeholder
      }))

      // 转换流程节点
      const workflowNodes = nodes.map(node => ({
        nodeName: node.data.label,
        nodeKey: node.data.nodeKey,
        nodeType: node.data.nodeType?.toUpperCase(),
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
        config: JSON.stringify({
          assignees: node.data.approvers,
          approveMode: node.data.approveMode,
          condition: node.data.condition,
          timeout: node.data.timeout,
          description: node.data.description
        })
      }))

      // 转换连线
      const workflowEdges = edges.map(edge => ({
        sourceNodeKey: edge.source,
        targetNodeKey: edge.target,
        conditionExpr: edge.data?.condition,
        priority: edge.data?.priority
      }))

      const config = {
        nodes: workflowNodes,
        edges: workflowEdges,
        formSchema: {
          config: formConfig,
          fields: convertedFields
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

  /**
   * 根据字段名称生成字段标识
   * 将中文或特殊字符转换为拼音或简单的标识符
   */
  const generateFieldName = (name: string): string => {
    if (!name) return 'field_' + Date.now()

    // 简单的映射规则，常见字段可以直接映射
    const fieldMapping: Record<string, string> = {
      '标题': 'title',
      '描述': 'description',
      '优先级': 'priority',
      '名称': 'name',
      '数量': 'quantity',
      '金额': 'amount',
      '类型': 'type',
      '日期': 'date',
      '开始日期': 'startDate',
      '结束日期': 'endDate',
      '天数': 'days',
      '原因': 'reason',
      '供应商': 'supplier',
      '物品名称': 'itemName',
      '费用类型': 'expenseType',
      '费用说明': 'explanation',
      '出差类型': 'tripType',
      '出差地点': 'destination',
      '预算': 'budget',
      '印章类型': 'sealType',
      '文件名称': 'docName',
      '文件份数': 'docCount',
      '用印事由': 'usage',
      '请假类型': 'leaveType',
      '请假天数': 'leaveDays'
    }

    // 如果有直接映射，使用映射值
    if (fieldMapping[name]) {
      return fieldMapping[name]
    }

    // 否则，移除特殊字符，转换为小写，添加 _field 后缀
    return name
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')  // 保留中文、字母、数字
      .replace(/_+/g, '_')  // 多个下划线合并为一个
      .replace(/^_|_$/g, '')  // 去除首尾下划线
      .toLowerCase() + '_field'
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="form">表单配置</TabsTrigger>
              <TabsTrigger value="design">流程设计</TabsTrigger>
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
                              <Label>字段标签</Label>
                              <Input
                                value={field.name}
                                onChange={(e) => handleUpdateFormField(index, { name: e.target.value })}
                                placeholder="如：请假类型"
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
                            <Label>字段标识（自动生成，可修改）</Label>
                            <Input
                              value={field.fieldName || generateFieldName(field.name)}
                              onChange={(e) => handleUpdateFormField(index, { fieldName: e.target.value })}
                              placeholder="如：leaveType"
                              className="font-mono text-sm"
                            />
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

            <TabsContent value="design" className="mt-4">
              <Card className="h-[600px]">
                <CardContent className="h-full p-4">
                  <FlowDesigner
                    initialNodes={nodes}
                    initialEdges={edges}
                    onChange={(newNodes, newEdges) => {
                      setNodes(newNodes as any)
                      setEdges(newEdges as any)
                    }}
                  />
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
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Badge } from '../../ui/badge'
import { Trash2, Save } from 'lucide-react'
import { Node } from '@xyflow/react'
import { ApproverSelector, Approver } from './ApproverSelector'

interface NodePropertiesPanelProps {
  node: Node | null
  onUpdate: (nodeId: string, updates: any) => void
  onDelete: (nodeId: string) => void
  onClose?: () => void
}

export function NodePropertiesPanel({ node, onUpdate, onDelete, onClose }: NodePropertiesPanelProps) {
  if (!node) {
    return (
      <div className="w-64 p-4 text-center text-muted-foreground text-xs text-gray-500">
        点击节点编辑属性
      </div>
    )
  }

  const data = node.data || {}
  const nodeType = data.nodeType || node.type

  const handleFieldChange = (field: string, value: any) => {
    onUpdate(node.id, { ...data, [field]: value })
  }

  const getNodeTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'start': '开始节点',
      'end': '结束节点',
      'approve': '审批节点',
      'cc': '抄送节点',
      'condition': '条件节点',
      'task': '任务节点'
    }
    return typeMap[type] || type
  }

  const getNodeTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'start': 'bg-green-100 text-green-700',
      'end': 'bg-red-100 text-red-700',
      'approve': 'bg-blue-100 text-blue-700',
      'cc': 'bg-purple-100 text-purple-700',
      'condition': 'bg-orange-100 text-orange-700',
      'task': 'bg-gray-100 text-gray-700'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <Card className="w-72 max-h-[calc(100vh-180px)] overflow-y-auto shadow-sm">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">节点属性</CardTitle>
          {nodeType !== 'start' && nodeType !== 'end' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(node.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <Badge className={`${getNodeTypeColor(nodeType)} text-xs mt-1`} variant="secondary">
          {getNodeTypeLabel(nodeType)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 px-3 pb-3">
        {/* 节点基本信息 */}
        <div className="space-y-1">
          <Label htmlFor="nodeLabel" className="text-xs">节点名称 *</Label>
          <Input
            id="nodeLabel"
            value={data.label || ''}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder="请输入节点名称"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="nodeKey" className="text-xs">节点标识 *</Label>
          <Input
            id="nodeKey"
            value={data.nodeKey || ''}
            onChange={(e) => handleFieldChange('nodeKey', e.target.value)}
            placeholder="如：dept_approve"
            className="h-8 text-sm"
          />
        </div>

        {/* 审批节点特有属性 */}
        {(nodeType === 'approve' || nodeType === 'cc') && (
          <div className="border-t pt-2">
            <ApproverSelector
              approvers={data.approvers || []}
              onChange={(approvers) => handleFieldChange('approvers', approvers)}
              label={nodeType === 'approve' ? '审批人' : '抄送人'}
            />
          </div>
        )}

        {/* 审批节点额外属性 */}
        {nodeType === 'approve' && (
          <div className="space-y-2 border-t pt-2">
            <div className="space-y-1">
              <Label htmlFor="approveMode" className="text-xs">审批模式</Label>
              <Select
                value={data.approveMode || 'or'}
                onValueChange={(value) => handleFieldChange('approveMode', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="or">或签（任意一人同意）</SelectItem>
                  <SelectItem value="and">会签（所有人都同意）</SelectItem>
                  <SelectItem value="sequential">顺序审批</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="timeout" className="text-xs">超时时间（小时）</Label>
              <Input
                id="timeout"
                type="number"
                value={data.timeout || ''}
                onChange={(e) => handleFieldChange('timeout', Number(e.target.value))}
                placeholder="留空表示不限时"
                className="h-8 text-xs"
              />
            </div>
          </div>
        )}

        {/* 条件节点特有属性 */}
        {nodeType === 'condition' && (
          <div className="space-y-2 border-t pt-2">
            <div className="space-y-1">
              <Label htmlFor="condition" className="text-xs">条件表达式</Label>
              <Textarea
                id="condition"
                value={data.condition || ''}
                onChange={(e) => handleFieldChange('condition', e.target.value)}
                placeholder="如：amount &gt; 1000"
                rows={2}
                className="text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                支持 SpEL，如 amount &gt; 1000
              </p>
            </div>
          </div>
        )}

        {/* 备注信息 */}
        <div className="space-y-1 border-t pt-2">
          <Label htmlFor="description" className="text-xs">备注说明</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="请输入节点说明（可选）"
            rows={2}
            className="text-xs"
          />
        </div>

        {/* 保存按钮 */}
        <Button
          onClick={() => onClose && onClose()}
          className="w-full h-8 text-sm"
          size="sm"
        >
          <Save className="w-3 h-3 mr-1" />
          完成编辑
        </Button>
      </CardContent>
    </Card>
  )
}

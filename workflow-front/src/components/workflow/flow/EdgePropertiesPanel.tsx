import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Badge } from '../../ui/badge'
import { Trash2, Save } from 'lucide-react'
import { Edge } from '@xyflow/react'

interface EdgePropertiesPanelProps {
  edge: Edge | null
  onUpdate: (edgeId: string, updates: any) => void
  onDelete: (edgeId: string) => void
  onClose?: () => void
}

export function EdgePropertiesPanel({ edge, onUpdate, onDelete, onClose }: EdgePropertiesPanelProps) {
  if (!edge) {
    return (
      <div className="w-72 p-4 text-center text-muted-foreground text-xs text-gray-500 mt-4">
        点击连线编辑属性
      </div>
    )
  }

  const data = edge.data || {}

  const handleFieldChange = (field: string, value: any) => {
    onUpdate(edge.id, { ...data, [field]: value })
  }

  return (
    <Card className="w-72 mt-2 shadow-sm">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">连线属性</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(edge.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Badge variant="outline" className="text-[10px] h-5">{data.sourceLabel || '源节点'}</Badge>
          <span className="text-gray-400">→</span>
          <Badge variant="outline" className="text-[10px] h-5">{data.targetLabel || '目标节点'}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-3 pb-3">
        {/* 连线类型 */}
        <div className="space-y-1">
          <Label htmlFor="edgeType" className="text-xs">连线类型</Label>
          <Select
            value={data.edgeType || 'default'}
            onValueChange={(value) => {
              handleFieldChange('edgeType', value)
              if (value === 'conditional') {
                handleFieldChange('type', 'conditional')
              } else {
                handleFieldChange('type', 'default')
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认连线</SelectItem>
              <SelectItem value="conditional">条件连线</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            {data.edgeType === 'conditional' ? '根据表达式判断是否流转' : '无条件流转'}
          </p>
        </div>

        {/* 条件表达式 */}
        {data.edgeType === 'conditional' && (
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
              支持 SpEL 表达式
            </p>
          </div>
        )}

        {/* 连线标签 */}
        <div className="space-y-1">
          <Label htmlFor="label" className="text-xs">连线标签</Label>
          <Input
            id="label"
            value={data.label || ''}
            onChange={(e) => handleFieldChange('label', e.target.value)}
            placeholder="如：通过、拒绝"
            className="h-8 text-xs"
          />
        </div>

        {/* 优先级 */}
        <div className="space-y-1">
          <Label htmlFor="priority" className="text-xs">优先级</Label>
          <Input
            id="priority"
            type="number"
            value={data.priority || ''}
            onChange={(e) => handleFieldChange('priority', Number(e.target.value))}
            placeholder="0"
            min="0"
            className="h-8 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            数字越小优先级越高
          </p>
        </div>

        {/* 备注信息 */}
        <div className="space-y-1 border-t pt-2">
          <Label htmlFor="description" className="text-xs">备注说明</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="请输入连线说明（可选）"
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

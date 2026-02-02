import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { WorkflowTemplate } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/hooks/useToast'
import {
  FileText,
  GitBranch,
  ArrowRight,
  Layers,
  Settings,
  Play
} from 'lucide-react'

interface TemplateDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: WorkflowTemplate | null
  onSuccess: () => void
}

export function TemplateDetailDialog({ open, onOpenChange, template, onSuccess }: TemplateDetailDialogProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'nodes' | 'edges'>('info')
  const [templateDetail, setTemplateDetail] = useState<any>(null)

  useEffect(() => {
    if (template && open) {
      loadTemplateDetail()
    }
  }, [template, open])

  const loadTemplateDetail = async () => {
    if (!template) return

    setLoading(true)
    try {
      const response = await apiService.template.getTemplateDetail(template.id)
      if (response.code === 200) {
        setTemplateDetail(response.data)
      }
    } catch (error) {
      console.error('加载模板详情失败:', error)
      toast.error('加载模板详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!template) return

    try {
      const response = await apiService.template.publishTemplate(template.id)
      if (response.code === 200) {
        toast.success('发布成功')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(`发布失败: ${response.message}`)
      }
    } catch (error) {
      console.error('发布失败:', error)
      toast.error('发布失败，请稍后重试')
    }
  }

  const getNodeTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'START': return <Play className="w-4 h-4 text-green-600" />
      case 'END': return <FileText className="w-4 h-4 text-red-600" />
      case 'APPROVE': return <Layers className="w-4 h-4 text-blue-600" />
      case 'CONDITION': return <GitBranch className="w-4 h-4 text-orange-600" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>模板详情 - {template.templateName}</span>
            </DialogTitle>
            {template.status === 0 && (
              <Button onClick={handlePublish} disabled={loading}>
                <Play className="w-4 h-4 mr-2" />
                发布模板
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">基本信息</TabsTrigger>
            <TabsTrigger value="nodes">节点列表</TabsTrigger>
            <TabsTrigger value="edges">连线列表</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>模板信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">模板关键字</div>
                    <div className="font-mono text-sm bg-muted p-2 rounded mt-1">
                      {template.templateKey}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">模板名称</div>
                    <div className="font-medium mt-1">{template.templateName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">分类</div>
                    <div className="mt-1">
                      {template.category ? (
                        <Badge variant="outline">{template.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">未分类</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">版本</div>
                    <div className="font-medium mt-1">v{template.version}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">状态</div>
                    <div className="mt-1">
                      <Badge variant={template.status === 1 ? 'default' : 'secondary'}>
                        {template.status === 1 ? '已启用' : '未启用'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">排序</div>
                    <div className="font-medium mt-1">{template.sortOrder || 0}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">模板描述</div>
                    <div className="mt-1">{template.templateDesc || '暂无描述'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">创建时间</div>
                    <div className="mt-1">{formatDate(template.createTime)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">更新时间</div>
                    <div className="mt-1">{formatDate(template.updateTime)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {templateDetail && (
              <Card>
                <CardHeader>
                  <CardTitle>统计信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">节点数量</div>
                      <div className="text-2xl font-bold">
                        {templateDetail.nodes?.length || 0}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">连线数量</div>
                      <div className="text-2xl font-bold">
                        {templateDetail.edges?.length || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nodes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>模板节点列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : !templateDetail || !templateDetail.nodes || templateDetail.nodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无节点
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templateDetail.nodes.map((node: any) => (
                      <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getNodeTypeIcon(node.nodeType)}
                          <div>
                            <div className="font-medium">{node.nodeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {node.nodeKey} • {node.nodeType}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          位置: ({node.positionX}, {node.positionY})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edges" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>模板连线列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : !templateDetail || !templateDetail.edges || templateDetail.edges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无连线
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templateDetail.edges.map((edge: any) => (
                      <div key={edge.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            节点 {edge.sourceNodeId} → 节点 {edge.targetNodeId}
                          </span>
                        </div>
                        {edge.conditionExpr && (
                          <Badge variant="outline" className="text-xs">
                            {edge.conditionExpr}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

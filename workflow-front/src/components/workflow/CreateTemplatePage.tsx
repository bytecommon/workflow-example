import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { useToast } from '@/hooks/useToast'
import { FlowDesigner } from './flow/FlowDesigner'
import { PageHeader } from '../layout/PageHeader'
import { Node, Edge } from '@xyflow/react'
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Layers,
  GitBranch,
  Settings
} from 'lucide-react'

interface CreateTemplatePageProps {
  onBack: () => void
  onSubmit: (data: any) => void
}

export function CreateTemplatePage({ onBack, onSubmit }: CreateTemplatePageProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [formData, setFormData] = useState({
    templateKey: '',
    templateName: '',
    templateDesc: '',
    category: '',
    icon: '',
    sortOrder: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.templateKey.trim()) {
      toast.error('模板关键字不能为空')
      setActiveTab('basic')
      return
    }

    if (!formData.templateName.trim()) {
      toast.error('模板名称不能为空')
      setActiveTab('basic')
      return
    }

    if (nodes.length === 0) {
      toast.error('请至少添加一个节点')
      setActiveTab('design')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        nodes,
        edges
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // 如果有未保存的更改，可以添加确认对话框
    onBack()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="新建流程模板"
        description="创建一个新的工作流模板"
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存模板'}
            </Button>
          </div>
        }
      />

      {/* 步骤指示器 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${activeTab === 'basic' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'basic' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Settings className="w-4 h-4" />
                </div>
                <span className="font-medium">基本信息</span>
              </div>
              <div className="w-16 h-px bg-border" />
              <div className={`flex items-center space-x-2 ${activeTab === 'design' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'design' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <GitBranch className="w-4 h-4" />
                </div>
                <span className="font-medium">流程设计</span>
              </div>
              <div className="w-16 h-px bg-border" />
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-medium">完成</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => {
        // 切换到流程设计标签页前验证基本信息
        if (value === 'design') {
          if (!formData.templateKey.trim()) {
            toast.error('请先填写模板关键字')
            return
          }
          if (!formData.templateName.trim()) {
            toast.error('请先填写模板名称')
            return
          }
        }
        setActiveTab(value)
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>基本信息</span>
          </TabsTrigger>
          <TabsTrigger
            value="design"
            className="flex items-center space-x-2"
            disabled={!formData.templateKey.trim() || !formData.templateName.trim()}
          >
            <GitBranch className="w-4 h-4" />
            <span>流程设计</span>
            {(!formData.templateKey.trim() || !formData.templateName.trim()) && (
              <span className="text-xs text-red-500 ml-1">*</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="w-5 h-5" />
                <span>模板基本信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="templateKey">
                    模板关键字 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="templateKey"
                    value={formData.templateKey}
                    onChange={(e) => setFormData({ ...formData, templateKey: e.target.value })}
                    placeholder="如：simple_approve"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    唯一标识，用于系统内部识别
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateName">
                    模板名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="templateName"
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    placeholder="如：简单审批流程"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    显示给用户的友好名称
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateDesc">模板描述</Label>
                <Textarea
                  id="templateDesc"
                  value={formData.templateDesc}
                  onChange={(e) => setFormData({ ...formData, templateDesc: e.target.value })}
                  placeholder="请输入模板的详细描述"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="通用">通用</SelectItem>
                      <SelectItem value="人事管理">人事管理</SelectItem>
                      <SelectItem value="财务管理">财务管理</SelectItem>
                      <SelectItem value="行政管理">行政管理</SelectItem>
                      <SelectItem value="采购管理">采购管理</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">图标</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="如：check-circle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">排序</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 下一步按钮 */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!formData.templateKey.trim()) {
                  toast.error('请先填写模板关键字')
                  return
                }
                if (!formData.templateName.trim()) {
                  toast.error('请先填写模板名称')
                  return
                }
                setActiveTab('design')
              }}
              size="lg"
              disabled={!formData.templateKey.trim() || !formData.templateName.trim()}
            >
              下一步：流程设计
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5" />
                <span>流程设计</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] border rounded-lg">
                <FlowDesigner
                  initialNodes={nodes}
                  initialEdges={edges}
                  onChange={(newNodes, newEdges) => {
                    setNodes(newNodes as any)
                    setEdges(newEdges as any)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab('basic')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            <Button onClick={handleSubmit} disabled={loading} size="lg">
              <Save className="w-4 h-4 mr-2" />
              {loading ? '保存中...' : '保存模板'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

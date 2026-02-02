import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { CreateTemplateDialog } from './CreateTemplateDialog'
import { TemplateDetailDialog } from './TemplateDetailDialog'
import { WorkflowTemplate, type Page } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/hooks/useToast'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  Copy,
  Eye,
  FileText
} from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { ConfirmDialog } from '../ui/confirm-dialog'

interface TemplateListProps {
  currentUser?: any
}

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  variant: 'default' | 'destructive'
  onConfirm: () => void
}

export function TemplateList({ currentUser }: TemplateListProps) {
  const toast = useToast()
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(undefined)
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    variant: 'default',
    onConfirm: () => {}
  })

  const showConfirm = (title: string, description: string, onConfirm: () => void, variant: 'default' | 'destructive' = 'default') => {
    setConfirmDialog({
      open: true,
      title,
      description,
      variant,
      onConfirm
    })
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async (params?: {
    templateName?: string
    category?: string
    status?: number
  }) => {
    setLoading(true)
    try {
      const response = await apiService.template.getTemplates({
        pageNum: 1,
        pageSize: 50,
        ...params
      })
      if (response.code === 200) {
        const pageData = response.data as Page<WorkflowTemplate>
        setTemplates(pageData?.records || (response.data as any).records || [])
        setSelectedTemplates([])
      }
    } catch (error) {
      console.error('获取模板列表失败:', error)
      toast.error('获取模板列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadTemplates({
      templateName: searchTerm || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedStatus(undefined)
    loadTemplates()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(templates.map(t => t.id))
    } else {
      setSelectedTemplates([])
    }
  }

  const handleSelectTemplate = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedTemplates(prev => [...prev, id])
    } else {
      setSelectedTemplates(prev => prev.filter(tid => tid !== id))
    }
  }

  const handleBatchPublish = async () => {
    if (selectedTemplates.length === 0) return

    showConfirm(
      '批量发布模板',
      `确定要批量发布选中的 ${selectedTemplates.length} 个模板吗？`,
      async () => {
        try {
          for (const id of selectedTemplates) {
            await apiService.template.publishTemplate(id)
          }
          await loadTemplates()
          toast.success('批量发布成功')
        } catch (error) {
          console.error('批量发布失败:', error)
          toast.error('批量发布失败，请稍后重试')
        }
      }
    )
  }

  const handleBatchDelete = async () => {
    if (selectedTemplates.length === 0) return

    showConfirm(
      '批量删除模板',
      `确定要批量删除选中的 ${selectedTemplates.length} 个模板吗？此操作不可恢复`,
      async () => {
        try {
          for (const id of selectedTemplates) {
            await apiService.template.deleteTemplate(id)
          }
          await loadTemplates()
          toast.success('批量删除成功')
        } catch (error) {
          console.error('批量删除失败:', error)
          toast.error('批量删除失败，请稍后重试')
        }
      },
      'destructive'
    )
  }

  const filteredTemplates = templates.filter(template =>
    template.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.templateKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.templateDesc?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)))

  const handleCreateTemplate = async (data: any) => {
    try {
      const response = await apiService.template.createTemplate(data)
      if (response.code === 200) {
        await loadTemplates()
        setShowCreateDialog(false)
        toast.success('创建模板成功')
      } else {
        toast.error(`创建模板失败: ${response.message}`)
      }
    } catch (error) {
      console.error('创建模板失败:', error)
      toast.error('创建模板失败，请稍后重试')
    }
  }

  const handlePublish = async (id: number) => {
    showConfirm(
      '发布流程模板',
      '确定要发布这个流程模板吗？发布后可用于创建流程定义',
      async () => {
        try {
          const response = await apiService.template.publishTemplate(id)
          if (response.code === 200) {
            await loadTemplates()
            toast.success('发布成功')
          } else {
            toast.error(`发布失败: ${response.message}`)
          }
        } catch (error) {
          console.error('发布失败:', error)
          toast.error('发布失败，请稍后重试')
        }
      }
    )
  }

  const handleDelete = async (id: number) => {
    showConfirm(
      '删除流程模板',
      '确定要删除这个流程模板吗？此操作不可恢复',
      async () => {
        try {
          const response = await apiService.template.deleteTemplate(id)
          if (response.code === 200) {
            await loadTemplates()
            toast.success('删除成功')
          } else {
            toast.error(`删除失败: ${response.message}`)
          }
        } catch (error) {
          console.error('删除失败:', error)
          toast.error('删除失败，请稍后重试')
        }
      },
      'destructive'
    )
  }

  const handleDetail = async (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    setShowDetailDialog(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>流程模板管理</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建模板
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 批量操作区域 */}
          {selectedTemplates.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-primary font-medium">
                    已选择 {selectedTemplates.length} 个模板
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchPublish}
                    disabled={selectedTemplates.length === 0}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    批量发布
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchDelete}
                    disabled={selectedTemplates.length === 0}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    批量删除
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 搜索和筛选区域 */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索模板名称、关键字或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8"
              />
            </div>

            {categories.length > 0 && (
              <div className="w-40">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">所有分类</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="w-32">
              <select
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border rounded"
              >
                <option value="">所有状态</option>
                <option value="0">未启用</option>
                <option value="1">已启用</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>
                重置
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50/80 p-4 rounded-lg">
              <div className="text-sm text-blue-600">总模板数</div>
              <div className="text-2xl font-bold">{templates.length}</div>
            </div>
            <div className="bg-green-50/80 p-4 rounded-lg">
              <div className="text-sm text-green-600">已启用</div>
              <div className="text-2xl font-bold">
                {templates.filter(t => t.status === 1).length}
              </div>
            </div>
            <div className="bg-orange-50/80 p-4 rounded-lg">
              <div className="text-sm text-orange-600">未启用</div>
              <div className="text-2xl font-bold">
                {templates.filter(t => t.status === 0).length}
              </div>
            </div>
          </div>

          {/* 模板列表 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTemplates.length === templates.length && templates.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead>模板名称</TableHead>
                <TableHead>关键字</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    暂无流程模板
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                        aria-label={`选择 ${template.templateName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>{template.templateName}</span>
                        {template.status === 1 && (
                          <Badge variant="secondary" className="text-xs">已启用</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {template.templateKey}
                      </code>
                    </TableCell>
                    <TableCell>
                      {template.category ? (
                        <Badge variant="outline">{template.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">未分类</span>
                      )}
                    </TableCell>
                    <TableCell>v{template.version}</TableCell>
                    <TableCell>
                      <Badge variant={template.status === 1 ? 'default' : 'secondary'}>
                        {template.status === 1 ? '已启用' : '未启用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(template.createTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="查看详情"
                          onClick={() => handleDetail(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {template.status === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="发布模板"
                            onClick={() => handlePublish(template.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          title="删除模板"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTemplate}
      />

      <TemplateDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        template={selectedTemplate}
        onSuccess={() => loadTemplates()}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={() => {
          confirmDialog.onConfirm()
          setConfirmDialog({ ...confirmDialog, open: false })
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </div>
  )
}

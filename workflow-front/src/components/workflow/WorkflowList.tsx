import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { PageHeader } from '../layout/PageHeader'
import { CreateWorkflowDialog } from './CreateWorkflowDialog'
import { WorkflowConfigDialog } from './WorkflowConfigDialog'
import { WorkflowEditDialog } from './WorkflowEditDialog'
import { WorkflowPreview } from './WorkflowPreview'
import { WorkflowDefinition, type Page } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/hooks/useToast'
import { WorkflowIcon } from './WorkflowIcon'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  Settings,
  Download,
  Upload,
  Copy,
  Eye,
  Check,
  X,
  EyeIcon
} from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { ConfirmDialog } from '../ui/confirm-dialog'

interface WorkflowListProps {
  currentUser?: any
}

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  variant: 'default' | 'destructive'
  onConfirm: () => void
}

export function WorkflowList({ currentUser }: WorkflowListProps) {
  const toast = useToast()
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(undefined)
  const [selectedWorkflows, setSelectedWorkflows] = useState<number[]>([])
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [versionFilter, setVersionFilter] = useState<string>('')
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    variant: 'default',
    onConfirm: () => {}
  })

  // 显示确认对话框的辅助函数
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
    loadWorkflows()
  }, [])

  const loadWorkflows = async (params?: {
    workflowName?: string
    status?: number
    category?: string
    version?: string
  }) => {
    setLoading(true)
    try {
      const response = await apiService.workflow.getDefinitions({
        pageNum: 1,
        pageSize: 50,
        ...params
      })
      if (response.code === 200) {
        const pageData = response.data as Page<WorkflowDefinition>
        setWorkflows(pageData?.records || (response.data as any).records || [])
        setSelectedWorkflows([]) // 清空选择
      }
    } catch (error) {
      console.error('获取流程列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadWorkflows({
      workflowName: searchTerm || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus,
      version: versionFilter || undefined
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedStatus(undefined)
    setVersionFilter('')
    setShowAdvancedSearch(false)
    loadWorkflows()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWorkflows(workflows.map(w => w.id))
    } else {
      setSelectedWorkflows([])
    }
  }

  const handleSelectWorkflow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedWorkflows(prev => [...prev, id])
    } else {
      setSelectedWorkflows(prev => prev.filter(wid => wid !== id))
    }
  }

  const handleBatchPublish = async () => {
    if (selectedWorkflows.length === 0) return
    
    showConfirm(
      '批量发布流程',
      `确定要批量发布选中的 ${selectedWorkflows.length} 个流程吗？`,
      async () => {
        try {
          for (const id of selectedWorkflows) {
            await apiService.workflow.publishDefinition(id)
          }
          await loadWorkflows()
        } catch (error) {
          console.error('批量发布失败:', error)
          toast.error('批量发布失败，请稍后重试')
        }
      }
    )
  }

  const handleBatchDelete = async () => {
    if (selectedWorkflows.length === 0) return
    
    showConfirm(
      '批量删除流程',
      `确定要批量删除选中的 ${selectedWorkflows.length} 个流程吗？此操作不可恢复`,
      async () => {
        try {
          for (const id of selectedWorkflows) {
            await apiService.workflow.deleteDefinition(id)
          }
          await loadWorkflows()
        } catch (error) {
          console.error('批量删除失败:', error)
          toast.error('批量删除失败，请稍后重试')
        }
      },
      'destructive'
    )
  }

  const handleCopyWorkflow = async (workflow: WorkflowDefinition) => {
    try {
      const response = await apiService.workflow.createDefinition({
        workflowKey: `${workflow.workflowKey}_COPY`,
        workflowName: `${workflow.workflowName} (副本)`,
        workflowDesc: workflow.workflowDesc,
        category: workflow.category,
        formId: workflow.formId,
        icon: workflow.icon
      })
      
      if (response.code === 200) {
        await loadWorkflows()
        toast.success('流程复制成功')
      }
    } catch (error) {
      console.error('复制流程失败:', error)
      toast.error('复制流程失败，请稍后重试')
    }
  }

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.workflowKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.workflowDesc?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 获取所有分类用于筛选
  const categories = Array.from(new Set(workflows.map(w => w.category).filter(Boolean)))

  const handleCreateWorkflow = async (data: any) => {
    try {
      const response = await apiService.workflow.createDefinition(data)
      if (response.code === 200) {
        await loadWorkflows()
        setShowCreateDialog(false)
      } else {
        toast.error(`创建流程失败: ${response.message}`)
      }
    } catch (error) {
      console.error('创建流程失败:', error)
      toast.error('创建流程失败，请稍后重试')
    }
  }

  const handlePublish = async (id: number) => {
    showConfirm(
      '发布流程定义',
      '确定要发布这个流程定义吗？发布后将无法修改',
      async () => {
        try {
          const response = await apiService.workflow.publishDefinition(id)
          if (response.code === 200) {
            await loadWorkflows()
          } else {
            toast.error(`发布流程失败: ${response.message}`)
          }
        } catch (error) {
          console.error('发布流程失败:', error)
          toast.error('发布流程失败，请稍后重试')
        }
      }
    )
  }

  const handleDelete = async (id: number) => {
    showConfirm(
      '删除流程定义',
      '确定要删除这个流程定义吗？此操作不可恢复',
      async () => {
        try {
          const response = await apiService.workflow.deleteDefinition(id)
          if (response.code === 200) {
            await loadWorkflows()
          } else {
            toast.error(`删除流程失败: ${response.message}`)
          }
        } catch (error) {
          console.error('删除流程失败:', error)
          toast.error('删除流程失败，请稍后重试')
        }
      },
      'destructive'
    )
  }

  const handleConfigure = async (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow)
    setShowConfigDialog(true)
  }

  const handleEdit = async (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow)
    setShowEditDialog(true)
  }

  const handlePreview = async (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow)
    setShowPreviewDialog(true)
  }

  const handleConfigSave = (config: any) => {
    console.log('配置保存成功:', config)
    loadWorkflows()
  }

  const handleWorkflowSave = (workflow: WorkflowDefinition) => {
    console.log('流程保存成功:', workflow)
    loadWorkflows()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="流程定义管理"
        description="管理和配置工作流定义"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新建流程
          </Button>
        }
      />

      <Card>
        <CardContent>
          {/* 批量操作区域 */}
          {selectedWorkflows.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-primary font-medium">
                    已选择 {selectedWorkflows.length} 个流程
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBatchPublish}
                    disabled={selectedWorkflows.length === 0}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    批量发布
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBatchDelete}
                    disabled={selectedWorkflows.length === 0}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    批量删除
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedWorkflows([])}
                >
                  <X className="w-4 h-4 mr-2" />
                  取消选择
                </Button>
              </div>
            </div>
          )}

          {/* 搜索和筛选区域 */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索流程名称、关键字或描述..."
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
              
              <div className="flex space-x-2">
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  重置
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                >
                  高级筛选
                </Button>
              </div>
            </div>

            {/* 高级筛选区域 */}
            {showAdvancedSearch && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">状态筛选</label>
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
                <div>
                  <label className="block text-sm font-medium mb-2">版本筛选</label>
                  <Input
                    placeholder="版本号..."
                    value={versionFilter}
                    onChange={(e) => setVersionFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full">
                    应用筛选
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50/80 p-4 rounded-lg">
              <div className="text-sm text-blue-600">总流程数</div>
              <div className="text-2xl font-bold">{workflows.length}</div>
            </div>
            <div className="bg-green-50/80 p-4 rounded-lg">
              <div className="text-sm text-green-600">已启用</div>
              <div className="text-2xl font-bold">
                {workflows.filter(w => w.status === 1).length}
              </div>
            </div>
            <div className="bg-orange-50/80 p-4 rounded-lg">
              <div className="text-sm text-orange-600">未启用</div>
              <div className="text-2xl font-bold">
                {workflows.filter(w => w.status === 0).length}
              </div>
            </div>
            <div className="bg-purple-50/80 p-4 rounded-lg">
              <div className="text-sm text-purple-600">分类数</div>
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>
          </div>

          {/* 流程列表 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedWorkflows.length === workflows.length && workflows.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="全选"
                  />
                </TableHead>
                <TableHead>流程名称</TableHead>
                <TableHead>关键字</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
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
              ) : filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    暂无流程定义
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWorkflows.includes(workflow.id)}
                        onCheckedChange={(checked) => handleSelectWorkflow(workflow.id, checked as boolean)}
                        aria-label={`选择 ${workflow.workflowName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <WorkflowIcon 
                          workflowKey={workflow.workflowKey} 
                          className="h-5 w-5 text-blue-600" 
                        />
                        <span>{workflow.workflowName}</span>
                        {workflow.status === 1 && (
                          <Badge variant="secondary" className="text-xs">已发布</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {workflow.workflowKey}
                      </code>
                    </TableCell>
                    <TableCell>
                      {workflow.category ? (
                        <Badge variant="outline">{workflow.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">未分类</span>
                      )}
                    </TableCell>
                    <TableCell>v{workflow.version}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workflow.status)}>
                        {getStatusText(workflow.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(workflow.createTime)}</TableCell>
                    <TableCell>{formatDate(workflow.updateTime)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="流程预览"
                          onClick={() => handlePreview(workflow)}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="编辑流程"
                          onClick={() => handleEdit(workflow)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="流程配置"
                          onClick={() => handleConfigure(workflow)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        
                        {workflow.status === 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="发布流程"
                            onClick={() => handlePublish(workflow.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="复制流程"
                          onClick={() => handleCopyWorkflow(workflow)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="删除流程"
                          onClick={() => handleDelete(workflow.id)}
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

      <CreateWorkflowDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateWorkflow}
      />

      <WorkflowConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        workflow={selectedWorkflow}
        onSave={handleConfigSave}
      />

      <WorkflowEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        workflow={selectedWorkflow}
        onSave={handleWorkflowSave}
      />

      <WorkflowPreview
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        workflow={selectedWorkflow}
      />
    </div>
  )
}
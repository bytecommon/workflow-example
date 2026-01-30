import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { InstanceDetailDialog } from './InstanceDetailDialog'
import { WorkflowInstance, InstanceDetailVO, type Page } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { Search, Eye, Play, Square } from 'lucide-react'
import { ConfirmDialog } from '../ui/confirm-dialog'

interface InstanceListProps {
  currentUser?: any
}

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  variant: 'default' | 'destructive'
  onConfirm: () => void
}

export function InstanceList({ currentUser }: InstanceListProps) {
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
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
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadInstances()
  }, [currentUser])

  const loadInstances = async () => {
    if (!currentUser?.id) return
    
    setLoading(true)
    try {
      // 使用新的API服务获取数据，传递参数对象
      const response = await apiService.instance.getMyInstances({
        userId: currentUser.id,
        pageNum: 1,
        pageSize: 20
      })
      if (response.code === 200) {
        // 处理分页响应，提取records数组
        const pageData = response.data as Page<WorkflowInstance>
        setInstances(pageData.records || [])
      }
    } catch (error) {
      console.error('获取实例列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInstances = instances.filter(instance => {
    const matchesSearch =
      (instance.workflowName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.instanceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.title || '').toLowerCase().includes(searchTerm.toLowerCase())

    const statusStr = String(instance.status).toUpperCase()
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'running' && statusStr === 'RUNNING') ||
      (statusFilter === 'completed' && statusStr === 'APPROVED') ||
      (statusFilter === 'terminated' && (statusStr === 'REJECTED' || statusStr === 'CANCELED' || statusStr === 'TERMINATED'))

    return matchesSearch && matchesStatus
  })

  const handleInstanceClick = async (instance: WorkflowInstance) => {
    try {
      console.log('点击流程实例:', instance)
      if (!instance?.id) {
        console.error('实例ID不存在:', instance)
        return
      }
      const response = await apiService.instance.getInstanceDetail(instance.id)
      console.log('获取实例详情响应:', response)
      if (response.code === 200 && response.data) {
        setSelectedInstance(response.data)
        setShowDetailDialog(true)
      } else {
        console.error('获取实例详情失败:', response.message)
      }
    } catch (error) {
      console.error('获取实例详情失败:', error)
    }
  }

  const handleTerminate = async (id: number) => {
    showConfirm(
      '终止流程实例',
      '确定要终止这个流程实例吗？',
      () => {
        try {
          // 模拟终止操作
          setInstances(instances.map(instance =>
            instance.id === id ? { ...instance, status: 'TERMINATED', endTime: new Date().toISOString() } : instance
          ))
        } catch (error) {
          console.error('终止实例失败:', error)
        }
      },
      'destructive'
    )
  }

  const statusFilters = [
    { value: 'all', label: '全部', count: instances.length },
    { value: 'running', label: '运行中', count: instances.filter(i => String(i.status).toUpperCase() === 'RUNNING').length },
    { value: 'completed', label: '已通过', count: instances.filter(i => String(i.status).toUpperCase() === 'APPROVED').length },
    { value: 'terminated', label: '已结束', count: instances.filter(i => ['REJECTED', 'CANCELED', 'TERMINATED'].includes(String(i.status).toUpperCase())).length }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>流程实例查询</CardTitle>
            <Button variant="outline" onClick={loadInstances} disabled={loading}>
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索流程标题、工作流名称或实例编号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {statusFilters.map(filter => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className="relative"
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <span className="ml-1 text-xs bg-primary-foreground text-primary rounded-full px-1.5 py-0.5">
                      {filter.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>实例编号</TableHead>
                <TableHead>流程标题</TableHead>
                <TableHead>工作流名称</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>结束时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredInstances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无流程实例
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstances.map((instance) => (
                  <TableRow key={instance.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{instance.instanceNo}</TableCell>
                    <TableCell className="font-medium">{instance.title}</TableCell>
                    <TableCell>{instance.workflowName}</TableCell>
                    <TableCell>{formatDate(instance.startTime)}</TableCell>
                    <TableCell>
                      {instance.endTime ? formatDate(instance.endTime) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(instance.status)}>
                        {getStatusText(instance.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInstanceClick(instance)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {String(instance.status).toUpperCase() === 'RUNNING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTerminate(instance.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InstanceDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        instance={selectedInstance}
      />
    </div>
  )
}
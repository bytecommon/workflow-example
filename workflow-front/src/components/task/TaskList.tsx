import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { PageHeader } from '../layout/PageHeader'
import { TaskDetailDialog } from './TaskDetailDialog'
import { WorkflowTask, type Page } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { Search, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface TaskListProps {
  currentUser?: any
}

export function TaskList({ currentUser }: TaskListProps) {
  const [tasks, setTasks] = useState<WorkflowTask[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [currentUser])

  const loadTasks = async () => {
    if (!currentUser?.id) return
    
    setLoading(true)
    try {
      // 使用新的API服务获取数据，传递参数对象
      const response = await apiService.task.getPendingTasks({
        userId: currentUser.id,
        pageNum: 1,
        pageSize: 20
      })
      if (response.code === 200) {
        // 处理分页响应，提取records数组
        const pageData = response.data as Page<WorkflowTask>
        setTasks(pageData.records || [])
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.definitionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.nodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.instanceId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingTasks = filteredTasks.filter(task => task.status === 10)
  const completedTasks = filteredTasks.filter(task => task.status === 11)

  const handleTaskClick = (task: WorkflowTask) => {
    setSelectedTask(task)
    setShowDetailDialog(true)
  }

  const handleApprove = async (taskId: number, comment: string) => {
    try {
      // 模拟审批操作
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 11, finishTime: new Date().toISOString() } : task
      ))
      setShowDetailDialog(false)
    } catch (error) {
      console.error('审批任务失败:', error)
    }
  }

  const handleReject = async (taskId: number, comment: string) => {
    try {
      // 模拟驳回操作
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 11, finishTime: new Date().toISOString() } : task
      ))
      setShowDetailDialog(false)
    } catch (error) {
      console.error('驳回任务失败:', error)
    }
  }

  const handleTransfer = async (taskId: number, targetUserId: string, comment: string) => {
    try {
      // 模拟转办操作
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 12 } : task
      ))
      setShowDetailDialog(false)
    } catch (error) {
      console.error('转办任务失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="我的待办任务"
        description="查看和处理您的工作流任务"
        actions={
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              <Clock className="w-3 h-3 mr-1" />
              待处理: {pendingTasks.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              已处理: {completedTasks.length}
            </Badge>
          </div>
        }
      />

      <Card>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索流程名称、节点名称或实例ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 待处理任务 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              待处理任务
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>流程名称</TableHead>
                <TableHead>任务节点</TableHead>
                <TableHead>实例编号</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>截止时间</TableHead>
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
                ) : pendingTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无待处理任务
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium">{task.definitionName}</TableCell>
                      <TableCell>{task.nodeName}</TableCell>
                      <TableCell className="font-mono text-sm">{task.instanceId}</TableCell>
                      <TableCell>{formatDate(task.createTime)}</TableCell>
                      <TableCell>
                        {task.dueTime && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-orange-500" />
                            {formatDate(task.dueTime)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleTaskClick(task)}
                        >
                          处理
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 已完成任务 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              已完成任务
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>流程名称</TableHead>
                  <TableHead>任务节点</TableHead>
                  <TableHead>实例ID</TableHead>
                  <TableHead>完成时间</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      暂无已完成任务
                    </TableCell>
                  </TableRow>
                ) : (
                  completedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.definitionName}</TableCell>
                      <TableCell>{task.nodeName}</TableCell>
                      <TableCell className="font-mono text-sm">{task.instanceId}</TableCell>
                      <TableCell>{task.finishTime ? formatDate(task.finishTime) : '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        task={selectedTask}
        onApprove={handleApprove}
        onReject={handleReject}
        onTransfer={handleTransfer}
      />
    </div>
  )
}
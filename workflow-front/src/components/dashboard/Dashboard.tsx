import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { WorkflowList } from '../workflow/WorkflowList'
import { TaskList } from '../task/TaskList'
import { StartWorkflowDialog } from '../workflow/StartWorkflowDialog'
import { WorkflowTask, WorkflowInstance, WorkflowCcVO } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { useToast } from '@/hooks/useToast'
import {
  TrendingUp,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
  ListTodo,
  Copy,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react'

interface DashboardProps {
  currentUser?: any
}

export function Dashboard({ currentUser }: DashboardProps) {
  const toast = useToast()
  const [statistics, setStatistics] = useState({
    totalInstances: 0,
    pendingTasks: 0,
    completedInstances: 0,
    runningInstances: 0,
    unreadCc: 0
  })

  const [recentTasks, setRecentTasks] = useState<WorkflowTask[]>([])
  const [recentInstances, setRecentInstances] = useState<WorkflowInstance[]>([])
  const [recentCc, setRecentCc] = useState<WorkflowCcVO[]>([])
  const [startWorkflowDialogOpen, setStartWorkflowDialogOpen] = useState(false)

  useEffect(() => {
    // 模拟数据加载
    loadStatistics()
    loadRecentTasks()
    loadRecentInstances()
    loadRecentCc()
  }, [currentUser])

  const loadStatistics = async () => {
    if (!currentUser?.id) return
    
    try {
      // 使用API服务获取数据，传递用户ID
      const response = await apiService.statistics.getStatistics(currentUser.id)
      
      // 获取未读抄送数量
      const ccResponse = await apiService.cc.getMyCc({
        userId: currentUser.id,
        pageSize: 100 // 获取所有抄送记录以统计未读数量
      })
      
      let unreadCcCount = 0
      if (ccResponse.code === 200 && ccResponse.data && 'records' in ccResponse.data) {
        unreadCcCount = (ccResponse.data.records as WorkflowCcVO[]).filter((cc: WorkflowCcVO) => cc.status === 0).length
      }
      
      if (response.code === 200) {
        setStatistics({
          ...response.data,
          unreadCc: unreadCcCount
        })
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const loadRecentTasks = async () => {
    // 模拟最近任务数据
    setRecentTasks([
      {
        id: 1,
        taskId: 'TASK_001',
        instanceId: 'INST_001',
        definitionId: 1,
        definitionName: '请假申请流程',
        nodeId: 'NODE_001',
        nodeName: '部门经理审批',
        assigneeId: 'user001',
        assigneeName: '张三',
        status: 10,
        statusText: '待处理',
        createTime: '2024-01-15T10:00:00',
        dueTime: '2024-01-18T10:00:00'
      },
      {
        id: 2,
        taskId: 'TASK_002',
        instanceId: 'INST_002',
        definitionId: 2,
        definitionName: '报销申请流程',
        nodeId: 'NODE_002',
        nodeName: '财务审核',
        assigneeId: 'user001',
        assigneeName: '张三',
        status: 10,
        statusText: '待处理',
        createTime: '2024-01-16T14:30:00',
        dueTime: '2024-01-19T14:30:00'
      }
    ])
  }

  const loadRecentInstances = async () => {
    if (!currentUser?.id) return
    
    try {
      // 使用API服务获取"我发起的流程"
      const response = await apiService.instance.getMyInstances({
        userId: currentUser.id,
        pageNum: 1,
        pageSize: 5
      })
      if (response.code === 200 && response.data && 'records' in response.data) {
        setRecentInstances(response.data.records as WorkflowInstance[])
      }
    } catch (error) {
      console.error('获取我发起的流程失败:', error)
      // 使用模拟数据作为后备
      setRecentInstances([
        {
          id: 1,
          instanceNo: 'INST-2024-001',
          workflowName: '请假审批',
          status: 'RUNNING',
          title: '李四的请假申请',
          startTime: '2024-01-15T09:00:00',
          priority: 0,
          starterUserId: 'user001',
          starterUserName: '张三'
        },
        {
          id: 2,
          instanceNo: 'INST-2024-002',
          workflowName: '报销审批',
          status: 'RUNNING',
          title: '王五的报销申请',
          startTime: '2024-01-16T13:00:00',
          priority: 0,
          starterUserId: 'user001',
          starterUserName: '张三'
        }
      ])
    }
  }

  const loadRecentCc = async () => {
    if (!currentUser?.id) return
    
    try {
      // 使用API服务获取"我的抄送"
      const response = await apiService.cc.getMyCc({
        userId: currentUser.id,
        pageNum: 1,
        pageSize: 5
      })
      if (response.code === 200 && response.data && 'records' in response.data) {
        setRecentCc(response.data.records as WorkflowCcVO[])
      }
    } catch (error) {
      console.error('获取我的抄送失败:', error)
      // 使用模拟数据作为后备
      setRecentCc([
        {
          id: 1,
          instanceId: 100,
          instanceNo: 'INST-2024-001',
          workflowName: '请假审批',
          nodeName: '部门经理审批',
          title: '张三的请假申请',
          startUserName: '张三',
          status: 0,
          createTime: '2024-01-15T09:00:00'
        },
        {
          id: 2,
          instanceId: 101,
          instanceNo: 'INST-2024-002',
          workflowName: '报销审批',
          nodeName: '财务审核',
          title: '李四的报销申请',
          startUserName: '李四',
          status: 1,
          createTime: '2024-01-16T10:00:00',
          readTime: '2024-01-16T11:00:00'
        }
      ])
    }
  }

  const handleStartWorkflow = async (data: any) => {
    console.log('Dashboard接收到工作流提交数据:', data)
    console.log('当前用户信息:', currentUser)
    try {
      const response = await apiService.instance.startInstance(data)
      console.log('API响应:', response)
      if (response.code === 200) {
        // 刷新统计数据和流程实例列表
        await Promise.all([
          loadStatistics(),
          loadRecentInstances()
        ])
        toast.success('流程发起成功！')
      } else {
        toast.error(response.message || '流程发起失败')
      }
    } catch (error) {
      console.error('发起流程失败:', error)
      toast.error('流程发起失败，请重试')
    }
  }

  const statCards = [
    {
      title: '待办任务',
      value: statistics.pendingTasks,
      icon: ListTodo,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50/80'
    },
    {
      title: '未读抄送',
      value: statistics.unreadCc,
      icon: Copy,
      color: 'text-red-600',
      bgColor: 'bg-red-50/80'
    },
    {
      title: '已完成实例',
      value: statistics.completedInstances,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50/80'
    },
    {
      title: '运行中实例',
      value: statistics.runningInstances,
      icon: PlayCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50/80'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                最近7天 +12%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 最近待办任务 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              待办任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{task.definitionName}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.nodeName} • 创建时间: {formatDate(task.createTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                    <Button size="sm">处理</Button>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无待办任务
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 我发起的流程 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              我发起的流程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInstances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{instance.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {instance.workflowName} • 开始时间: {formatDate(instance.startTime)}
                    </div>
                  </div>
                  <Badge className={getStatusColor(instance.status)}>
                    {getStatusText(instance.status)}
                  </Badge>
                </div>
              ))}
              {recentInstances.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无流程实例
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 我的抄送 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              我的抄送
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCc.map((cc) => (
                <div key={cc.id} className={`flex items-center justify-between p-3 border rounded-lg bg-card ${cc.status === 0 ? 'border-l-4 border-l-orange-500' : ''}`}>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{cc.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {cc.nodeName} • 发起人: {cc.startUserName} • {formatDate(cc.createTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cc.status === 0 && <Badge variant="secondary">未读</Badge>}
                    {cc.status === 1 && <Badge variant="outline">已读</Badge>}
                  </div>
                </div>
              ))}
              {recentCc.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无抄送消息
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 - 基于后端接口 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              className="gap-2"
              onClick={() => setStartWorkflowDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              发起流程申请
            </Button>
            <Button variant="outline" className="gap-2">
              <ListTodo className="h-4 w-4" />
              查看待办任务
            </Button>
            <Button variant="outline" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              查看我发起的流程
            </Button>
            <Button variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              查看我的抄送
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              数据统计
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 流程申请对话框 */}
      <StartWorkflowDialog
        open={startWorkflowDialogOpen}
        onOpenChange={setStartWorkflowDialogOpen}
        onSubmit={handleStartWorkflow}
        currentUser={currentUser}
      />
    </div>
  )
}
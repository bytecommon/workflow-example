import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { WorkflowList } from '../workflow/WorkflowList'
import { TaskList } from '../task/TaskList'
import { WorkflowTask, WorkflowInstance } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  FileText,
  ListTodo
} from 'lucide-react'

interface DashboardProps {
  currentUser?: any
}

export function Dashboard({ currentUser }: DashboardProps) {
  const [statistics, setStatistics] = useState({
    totalInstances: 0,
    pendingTasks: 0,
    completedInstances: 0,
    runningInstances: 0
  })

  const [recentTasks, setRecentTasks] = useState<WorkflowTask[]>([])
  const [recentInstances, setRecentInstances] = useState<WorkflowInstance[]>([])

  useEffect(() => {
    // 模拟数据加载
    loadStatistics()
    loadRecentTasks()
    loadRecentInstances()
  }, [currentUser])

  const loadStatistics = async () => {
    if (!currentUser?.id) return
    
    try {
      // 使用API服务获取数据，传递用户ID
      const response = await apiService.statistics.getStatistics(currentUser.id)
      if (response.code === 200) {
        setStatistics(response.data)
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
    // 模拟最近实例数据
    setRecentInstances([
      {
        id: 1,
        instanceId: 'INST_001',
        definitionId: 1,
        definitionName: '请假申请流程',
        currentTaskId: 1,
        status: 1,
        statusText: '运行中',
        startTime: '2024-01-15T09:00:00',
        starterUserId: 'user002',
        starterUserName: '李四'
      },
      {
        id: 2,
        instanceId: 'INST_002',
        definitionId: 2,
        definitionName: '报销申请流程',
        currentTaskId: 2,
        status: 1,
        statusText: '运行中',
        startTime: '2024-01-16T13:00:00',
        starterUserId: 'user003',
        starterUserName: '王五'
      }
    ])
  }

  const statCards = [
    {
      title: '总流程实例',
      value: statistics.totalInstances,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80'
    },
    {
      title: '待办任务',
      value: statistics.pendingTasks,
      icon: ListTodo,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50/80'
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近待办任务 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              最近待办任务
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

        {/* 最近流程实例 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              最近流程实例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInstances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{instance.definitionName}</div>
                    <div className="text-sm text-muted-foreground">
                      发起人: {instance.starterUserName} • 开始时间: {formatDate(instance.startTime)}
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
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>新建流程</Button>
            <Button variant="outline">查看所有待办</Button>
            <Button variant="outline">流程模板库</Button>
            <Button variant="outline">数据分析</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
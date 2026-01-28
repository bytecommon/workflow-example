import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { InstanceDetailVO, WorkflowTask, WorkflowHistory, WorkflowInstance } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText, getActionText } from '@/lib/utils'
import { Clock, User, FileText, History } from 'lucide-react'

interface InstanceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: WorkflowInstance | null
}

export function InstanceDetailDialog({ open, onOpenChange, instance }: InstanceDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [instanceDetail, setInstanceDetail] = useState<InstanceDetailVO | null>(null)

  useEffect(() => {
    if (instance) {
      // 模拟加载实例详情
      const mockDetail: InstanceDetailVO = {
        instance: instance,
        tasks: [
          {
            id: 1,
            taskId: 'TASK_001',
            instanceId: instance.instanceId,
            definitionId: instance.definitionId,
            definitionName: instance.definitionName,
            nodeId: 'NODE_001',
            nodeName: '发起申请',
            assigneeId: instance.starterUserId,
            assigneeName: instance.starterUserName,
            status: 11,
            statusText: '已处理',
            createTime: instance.startTime,
            finishTime: instance.startTime
          },
          {
            id: 2,
            taskId: 'TASK_002',
            instanceId: instance.instanceId,
            definitionId: instance.definitionId,
            definitionName: instance.definitionName,
            nodeId: 'NODE_002',
            nodeName: '部门经理审批',
            assigneeId: 'user001',
            assigneeName: '张三',
            status: instance.status === 1 ? 10 : 11,
            statusText: instance.status === 1 ? '待处理' : '已处理',
            createTime: instance.startTime,
            claimTime: instance.status === 1 ? undefined : '2024-01-15T10:00:00',
            finishTime: instance.status === 1 ? undefined : '2024-01-15T11:00:00'
          }
        ],
        history: [
          {
            id: 1,
            instanceId: instance.instanceId,
            taskId: 'TASK_001',
            nodeId: 'NODE_001',
            nodeName: '发起申请',
            action: 'START',
            actionText: '启动流程',
            operatorId: instance.starterUserId,
            operatorName: instance.starterUserName,
            comment: '提交申请',
            createTime: instance.startTime
          },
          {
            id: 2,
            instanceId: instance.instanceId,
            taskId: 'TASK_001',
            nodeId: 'NODE_001',
            nodeName: '发起申请',
            action: 'APPROVE',
            actionText: '审批通过',
            operatorId: instance.starterUserId,
            operatorName: instance.starterUserName,
            comment: '申请提交完成',
            createTime: instance.startTime
          }
        ],
        variables: {
          applicant: instance.starterUserName,
          department: '技术部',
          reason: '项目进度紧张，需要加班处理',
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          days: 3
        }
      }
      
      if (instance.status === 2 || instance.status === 3) {
        // 已完成或已终止的实例添加更多历史记录
        mockDetail.history.push(
          {
            id: 3,
            instanceId: instance.instanceId,
            taskId: 'TASK_002',
            nodeId: 'NODE_002',
            nodeName: '部门经理审批',
            action: 'APPROVE',
            actionText: '审批通过',
            operatorId: 'user001',
            operatorName: '张三',
            comment: '同意申请',
            createTime: '2024-01-15T11:00:00'
          }
        )
      }
      
      if (instance.status === 3) {
        // 已终止的实例添加终止记录
        mockDetail.history.push(
          {
            id: 4,
            instanceId: instance.instanceId,
            taskId: 'TASK_002',
            nodeId: 'NODE_002',
            nodeName: '部门经理审批',
            action: 'TERMINATE',
            actionText: '终止流程',
            operatorId: 'user001',
            operatorName: '张三',
            comment: '申请不符合要求，终止流程',
            createTime: instance.endTime || '2024-01-15T12:00:00'
          }
        )
      }
      
      setInstanceDetail(mockDetail)
    }
  }, [instance])

  if (!instance) return null

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            基本信息
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">实例ID:</span>
              <div className="font-mono">{instance.instanceId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">流程名称:</span>
              <div>{instance.definitionName}</div>
            </div>
            <div>
              <span className="text-muted-foreground">发起人:</span>
              <div>{instance.starterUserName}</div>
            </div>
            <div>
              <span className="text-muted-foreground">开始时间:</span>
              <div>{formatDate(instance.startTime)}</div>
            </div>
            {instance.endTime && (
              <div>
                <span className="text-muted-foreground">结束时间:</span>
                <div>{formatDate(instance.endTime)}</div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">状态:</span>
              <div>
                <Badge className={getStatusColor(instance.status)}>
                  {getStatusText(instance.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 流程变量 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">流程变量</h3>
          <div className="bg-muted/50 rounded-lg p-4">
            {instanceDetail && Object.entries(instanceDetail.variables).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b last:border-b-0">
                <span className="text-muted-foreground">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          任务节点
        </h3>
        {instanceDetail && (
          <div className="space-y-3">
            {instanceDetail.tasks.map((task, index) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{task.nodeName}</div>
                    <div className="text-sm text-muted-foreground">
                      处理人: {task.assigneeName}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>任务ID</TableHead>
            <TableHead>节点名称</TableHead>
            <TableHead>处理人</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>完成时间</TableHead>
            <TableHead>状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instanceDetail && instanceDetail.tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-mono text-sm">{task.taskId}</TableCell>
              <TableCell>{task.nodeName}</TableCell>
              <TableCell>{task.assigneeName}</TableCell>
              <TableCell>{formatDate(task.createTime)}</TableCell>
              <TableCell>{task.finishTime ? formatDate(task.finishTime) : '-'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>操作时间</TableHead>
            <TableHead>节点</TableHead>
            <TableHead>操作类型</TableHead>
            <TableHead>操作人</TableHead>
            <TableHead>备注</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instanceDetail && instanceDetail.history.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{formatDate(record.createTime)}</TableCell>
              <TableCell>{record.nodeName}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getActionText(record.action)}
                </Badge>
              </TableCell>
              <TableCell>{record.operatorName}</TableCell>
              <TableCell>{record.comment || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            流程实例详情
            {instance && (
              <Badge className={getStatusColor(instance.status)}>
                {getStatusText(instance.status)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="tasks">任务列表</TabsTrigger>
            <TabsTrigger value="history">操作历史</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="tasks">
            {renderTasks()}
          </TabsContent>
          
          <TabsContent value="history">
            {renderHistory()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
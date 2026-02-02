import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { InstanceDetailVO, InstanceInfoVO, InstanceFormDataVO, InstanceGraphVO, TaskVO, HistoryVO, WorkflowInstance } from '@/lib/api'
import { apiService } from '@/lib/apiService'
import { formatDate, getStatusColor, getStatusText, getActionText } from '@/lib/utils'
import { Clock, User, FileText, History } from 'lucide-react'

interface InstanceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: WorkflowInstance | null
}

export function InstanceDetailDialog({ open, onOpenChange, instance }: InstanceDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set())
  const [instanceInfo, setInstanceInfo] = useState<InstanceInfoVO | null>(null)
  const [instanceFormData, setInstanceFormData] = useState<InstanceFormDataVO | null>(null)
  const [instanceGraph, setInstanceGraph] = useState<InstanceGraphVO | null>(null)
  const [instanceTasks, setInstanceTasks] = useState<TaskVO[]>([])
  const [instanceHistory, setInstanceHistory] = useState<HistoryVO[]>([])

  // 重置状态当对话框关闭时
  useEffect(() => {
    if (!open) {
      setLoadedTabs(new Set())
      setInstanceInfo(null)
      setInstanceFormData(null)
      setInstanceGraph(null)
      setInstanceTasks([])
      setInstanceHistory([])
    }
  }, [open])

  // 根据activeTab加载对应的数据
  useEffect(() => {
    if (instance && open && !loadedTabs.has(activeTab)) {
      loadTabData(activeTab, instance.id)
    }
  }, [activeTab, instance, open, loadedTabs])

  const loadTabData = async (tab: string, instanceId: number) => {
    // 检查是否已加载
    if (loadedTabs.has(tab)) {
      return
    }

    setLoading(true)
    try {
      let response
      switch (tab) {
        case 'overview':
          response = await apiService.instance.getInstanceInfo(instanceId)
          if (response.code === 200) {
            setInstanceInfo(response.data)
            setLoadedTabs(prev => new Set(prev).add('overview'))
          }
          break
        case 'form':
          response = await apiService.instance.getInstanceFormData(instanceId)
          if (response.code === 200) {
            setInstanceFormData(response.data)
            setLoadedTabs(prev => new Set(prev).add('form'))
          }
          break
        case 'graph':
          response = await apiService.instance.getInstanceGraph(instanceId)
          if (response.code === 200) {
            setInstanceGraph(response.data)
            setLoadedTabs(prev => new Set(prev).add('graph'))
          }
          break
        case 'tasks':
          response = await apiService.instance.getInstanceTasks(instanceId)
          if (response.code === 200) {
            setInstanceTasks(response.data)
            setLoadedTabs(prev => new Set(prev).add('tasks'))
          }
          break
        case 'history':
          response = await apiService.instance.getInstanceHistory(instanceId)
          if (response.code === 200) {
            setInstanceHistory(response.data)
            setLoadedTabs(prev => new Set(prev).add('history'))
          }
          break
      }
    } catch (error) {
      console.error('加载tab数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!instance) return null

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-4">
          <FileText className="w-5 h-5 mr-2" />
          基本信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">实例编号:</span>
            <div className="font-mono">{instanceInfo?.instanceNo || instance?.instanceNo}</div>
          </div>
          <div>
            <span className="text-muted-foreground">流程标题:</span>
            <div>{instanceInfo?.title || instance?.title}</div>
          </div>
          <div>
            <span className="text-muted-foreground">工作流名称:</span>
            <div>{instanceInfo?.workflowName || instance?.workflowName}</div>
          </div>
          <div>
            <span className="text-muted-foreground">发起人:</span>
            <div>{instanceInfo?.startUserName || instance?.starterUserName || '-'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">开始时间:</span>
            <div>{formatDate(instanceInfo?.startTime || instance?.startTime)}</div>
          </div>
          {(instanceInfo?.endTime || instance?.endTime) && (
            <div>
              <span className="text-muted-foreground">结束时间:</span>
              <div>{formatDate(instanceInfo?.endTime || instance?.endTime)}</div>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">当前节点:</span>
            <div>{instanceInfo?.currentNodeName || '-'}</div>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground">状态:</span>
            <div className="mt-1">
              <Badge className={getStatusColor(Number(instanceInfo?.status === 'RUNNING' ? 1 : instanceInfo?.status === 'APPROVED' ? 2 : 3))}>
                {instanceInfo?.status === 'RUNNING' ? '运行中' : instanceInfo?.status === 'APPROVED' ? '已通过' : instanceInfo?.status === 'REJECTED' ? '已拒绝' : instanceInfo?.status === 'CANCELED' ? '已取消' : instanceInfo?.status === 'TERMINATED' ? '已终止' : getStatusText(instance?.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 当前节点状态 */}
      {instanceTasks && instanceTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2" />
            任务节点
          </h3>
          <div className="space-y-3">
            {instanceTasks.map((task, index) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${task.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{task.nodeName}</div>
                    <div className="text-sm text-muted-foreground">
                      发起人: {task.startUserName} • {formatDate(task.createTime)}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderForm = () => {
    // 解析表单配置，获取字段标签映射
    const fieldLabels: Record<string, string> = {}
    if (instanceFormData?.formConfig) {
      try {
        const config = typeof instanceFormData.formConfig === 'string'
          ? JSON.parse(instanceFormData.formConfig)
          : instanceFormData.formConfig

        if (config.fields && Array.isArray(config.fields)) {
          config.fields.forEach((field: any) => {
            if (field.name && field.label) {
              fieldLabels[field.name] = field.label
            }
          })
        }
      } catch (e) {
        console.error('解析formConfig失败:', e)
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center mb-4">
            <FileText className="w-5 h-5 mr-2" />
            表单数据
          </h3>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : instanceFormData ? (
            <div>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">表单名称:</span>
                <div className="font-medium">{instanceFormData.formName}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                {instanceFormData.dataMap ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(instanceFormData.dataMap).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          {fieldLabels[key] || key}:
                        </span>
                        <div className="font-medium">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                ) : instanceFormData.formData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      try {
                        const formData = JSON.parse(instanceFormData.formData)
                        return Object.entries(formData).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                              {fieldLabels[key] || key}:
                            </span>
                            <div className="font-medium">{String(value)}</div>
                          </div>
                        ))
                      } catch (e) {
                        console.error('解析formData失败:', e)
                        return <div className="text-red-500">表单数据解析失败</div>
                      }
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">暂无表单数据</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">暂无表单数据</div>
          )}
        </div>
      </div>
    )
  }

  const renderGraph = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-4">
          <History className="w-5 h-5 mr-2" />
          流程图
        </h3>
        <div className="border rounded-lg bg-muted/30 p-6 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">加载中...</div>
          ) : instanceGraph && instanceGraph.nodes && instanceGraph.edges ? (
            <div className="relative w-full" style={{ height: '400px' }}>
              {/* 流程图展示 */}
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {instanceGraph.edges.map((edge) => {
                  const source = instanceGraph.nodes?.find(n => n.id === edge.sourceNodeId)
                  const target = instanceGraph.nodes?.find(n => n.id === edge.targetNodeId)
                  if (!source || !target) return null
                  return (
                    <line
                      key={edge.id}
                      x1={source.positionX + 40}
                      y1={source.positionY + 20}
                      x2={target.positionX}
                      y2={target.positionY + 20}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                </defs>
                {instanceGraph.nodes.map((node) => {
                  const isCurrentNode = instanceGraph.currentNodeId === node.id
                  const isCompletedNode = instanceGraph.completedNodeIds?.includes(node.id)

                  return (
                    <g key={node.id}>
                      <rect
                        x={node.positionX}
                        y={node.positionY}
                        width={80}
                        height={40}
                        rx={4}
                        fill={
                          isCurrentNode ? '#fef08a' :
                          isCompletedNode ? '#dcfce7' :
                          node.nodeType === 'START' ? '#dcfce7' :
                          node.nodeType === 'END' ? '#fee2e2' :
                          '#e0f2fe'
                        }
                        stroke={
                          isCurrentNode ? '#eab308' :
                          isCompletedNode ? '#16a34a' :
                          node.nodeType === 'START' ? '#16a34a' :
                          node.nodeType === 'END' ? '#dc2626' :
                          '#0284c7'
                        }
                        strokeWidth={isCurrentNode ? '3' : '2'}
                      />
                      <text
                        x={node.positionX + 40}
                        y={node.positionY + 25}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontWeight={isCurrentNode ? 'bold' : 'normal'}
                      >
                        {node.nodeName}
                      </text>
                      {isCurrentNode && (
                        <circle
                          cx={node.positionX + 80}
                          cy={node.positionY + 10}
                          r={6}
                          fill="#eab308"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              暂无流程图数据
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>任务ID</TableHead>
              <TableHead>节点名称</TableHead>
              <TableHead>发起人</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>流程标题</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instanceTasks && instanceTasks.length > 0 ? (
              instanceTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-mono text-sm">{task.id}</TableCell>
                  <TableCell>{task.nodeName}</TableCell>
                  <TableCell>{task.startUserName}</TableCell>
                  <TableCell>{formatDate(task.createTime)}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无任务数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : (
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
            {instanceHistory && instanceHistory.length > 0 ? (
              instanceHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.operateTime)}</TableCell>
                  <TableCell>{record.nodeName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getActionText(record.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.operatorName}</TableCell>
                  <TableCell>{record.comment || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  暂无操作历史
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            流程实例详情
            {instanceInfo && (
              <Badge className={getStatusColor(Number(instanceInfo.status === 'RUNNING' ? 1 : instanceInfo.status === 'APPROVED' ? 2 : 3))}>
                {instanceInfo.status === 'RUNNING' ? '运行中' : instanceInfo.status === 'APPROVED' ? '已通过' : instanceInfo.status === 'REJECTED' ? '已拒绝' : instanceInfo.status === 'CANCELED' ? '已取消' : instanceInfo.status === 'TERMINATED' ? '已终止' : getStatusText(instance?.status)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="form">表单数据</TabsTrigger>
              <TabsTrigger value="graph">流程图</TabsTrigger>
              <TabsTrigger value="tasks">任务列表</TabsTrigger>
              <TabsTrigger value="history">操作历史</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="form" className="mt-4">
              {renderForm()}
            </TabsContent>

            <TabsContent value="graph" className="mt-4">
              {renderGraph()}
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              {renderTasks()}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {renderHistory()}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

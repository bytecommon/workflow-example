import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { WorkflowTask, InstanceFormDataVO } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { apiService } from '@/lib/apiService'
import { Loader2, FileText } from 'lucide-react'

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: WorkflowTask | null
  onApprove: (taskId: number, comment: string) => void
  onReject: (taskId: number, comment: string) => void
  onTransfer: (taskId: number, targetUserId: string, comment: string) => void
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  onApprove,
  onReject,
  onTransfer
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'form' | 'approve' | 'reject' | 'transfer'>('details')
  const [approveComment, setApproveComment] = useState('')
  const [rejectComment, setRejectComment] = useState('')
  const [transferUserId, setTransferUserId] = useState('')
  const [transferComment, setTransferComment] = useState('')
  const [instanceFormData, setInstanceFormData] = useState<InstanceFormDataVO | null>(null)
  const [loadingForm, setLoadingForm] = useState(false)

  // 加载表单数据
  useEffect(() => {
    if (open && task && activeTab === 'form' && !instanceFormData) {
      loadFormData()
    }
  }, [open, task, activeTab])

  const loadFormData = async () => {
    if (!task) return

    setLoadingForm(true)
    try {
      const response = await apiService.instance.getInstanceFormData(task.instanceId)
      if (response.code === 200) {
        setInstanceFormData(response.data)
      }
    } catch (error) {
      console.error('加载表单数据失败:', error)
    } finally {
      setLoadingForm(false)
    }
  }

  if (!task) return null

  const resetForm = () => {
    setApproveComment('')
    setRejectComment('')
    setTransferUserId('')
    setTransferComment('')
    setActiveTab('details')
  }

  const handleClose = () => {
    resetForm()
    setInstanceFormData(null)
    onOpenChange(false)
  }

  const handleApprove = () => {
    if (task) {
      onApprove(task.id, approveComment)
      resetForm()
    }
  }

  const handleReject = () => {
    if (task) {
      onReject(task.id, rejectComment)
      resetForm()
    }
  }

  const handleTransfer = () => {
    if (task && transferUserId) {
      onTransfer(task.id, transferUserId, transferComment)
      resetForm()
    }
  }

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
      <div className="space-y-4">
        <div>
          <Label>表单名称</Label>
          <div className="text-sm font-medium">{instanceFormData?.formName || '-'}</div>
        </div>
        {loadingForm ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : instanceFormData ? (
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">暂无表单数据</div>
        )}
      </div>
    )
  }

  const renderDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>流程名称</Label>
          <div className="text-sm font-medium">{task.definitionName}</div>
        </div>
        <div>
          <Label>任务节点</Label>
          <div className="text-sm font-medium">{task.nodeName}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>实例ID</Label>
          <div className="text-sm font-mono">{task.instanceId}</div>
        </div>
        <div>
          <Label>任务状态</Label>
          <div>
            <Badge className={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>创建时间</Label>
          <div className="text-sm">{formatDate(task.createTime)}</div>
        </div>
        <div>
          <Label>截止时间</Label>
          <div className="text-sm">
            {task.dueTime ? formatDate(task.dueTime) : '无'}
          </div>
        </div>
      </div>
      
      {task.claimTime && (
        <div>
          <Label>认领时间</Label>
          <div className="text-sm">{formatDate(task.claimTime)}</div>
        </div>
      )}
      
      {task.finishTime && (
        <div>
          <Label>完成时间</Label>
          <div className="text-sm">{formatDate(task.finishTime)}</div>
        </div>
      )}
    </div>
  )

  const renderApproveForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="approveComment">审批意见</Label>
        <Textarea
          id="approveComment"
          placeholder="请输入审批意见（可选）"
          value={approveComment}
          onChange={(e) => setApproveComment(e.target.value)}
          rows={3}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        确认通过此任务的审批吗？
      </div>
    </div>
  )

  const renderRejectForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="rejectComment">驳回原因</Label>
        <Textarea
          id="rejectComment"
          placeholder="请说明驳回原因"
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          rows={3}
          required
        />
      </div>
      <div className="text-sm text-muted-foreground">
        确认驳回此任务吗？任务将退回给发起人。
      </div>
    </div>
  )

  const renderTransferForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="transferUserId">转办人员ID</Label>
        <Input
          id="transferUserId"
          placeholder="请输入转办人员ID"
          value={transferUserId}
          onChange={(e) => setTransferUserId(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="transferComment">转办说明</Label>
        <Textarea
          id="transferComment"
          placeholder="请输入转办说明（可选）"
          value={transferComment}
          onChange={(e) => setTransferComment(e.target.value)}
          rows={3}
        />
      </div>
      <div className="text-sm text-muted-foreground">
        确认将此任务转办给其他人员吗？
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetails()
      case 'form':
        return renderForm()
      case 'approve':
        return renderApproveForm()
      case 'reject':
        return renderRejectForm()
      case 'transfer':
        return renderTransferForm()
      default:
        return renderDetails()
    }
  }

  const renderFooter = () => {
    if (activeTab === 'details') {
      return (
        <>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              基本信息
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'form'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              表单数据
            </button>
          </div>
          <DialogFooter className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab('transfer')}
              disabled={task.status !== 10}
            >
              转办
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('reject')}
              disabled={task.status !== 10}
            >
              驳回
            </Button>
            <Button
              onClick={() => setActiveTab('approve')}
              disabled={task.status !== 10}
            >
              通过
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (activeTab === 'form') {
      return (
        <>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              基本信息
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'form'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              表单数据
            </button>
          </div>
          <DialogFooter className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab('transfer')}
              disabled={task.status !== 10}
            >
              转办
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('reject')}
              disabled={task.status !== 10}
            >
              驳回
            </Button>
            <Button
              onClick={() => setActiveTab('approve')}
              disabled={task.status !== 10}
            >
              通过
            </Button>
          </DialogFooter>
        </>
      )
    }

    if (activeTab === 'approve') {
      return (
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('details')}>
            返回
          </Button>
          <Button onClick={handleApprove}>
            确认通过
          </Button>
        </DialogFooter>
      )
    }

    if (activeTab === 'reject') {
      return (
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('details')}>
            返回
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectComment}
          >
            确认驳回
          </Button>
        </DialogFooter>
      )
    }

    if (activeTab === 'transfer') {
      return (
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('details')}>
            返回
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!transferUserId}
          >
            确认转办
          </Button>
        </DialogFooter>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            任务详情
            {task && (
              <Badge className={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        {renderFooter()}
      </DialogContent>
    </Dialog>
  )
}
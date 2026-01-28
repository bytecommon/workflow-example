import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { WorkflowTask } from '@/lib/api'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'

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
  const [activeTab, setActiveTab] = useState<'details' | 'approve' | 'reject' | 'transfer'>('details')
  const [approveComment, setApproveComment] = useState('')
  const [rejectComment, setRejectComment] = useState('')
  const [transferUserId, setTransferUserId] = useState('')
  const [transferComment, setTransferComment] = useState('')

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
        <DialogFooter className="flex space-x-2">
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
      <DialogContent className="sm:max-w-[600px]">
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
import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { PlayCircle, CheckCircle, Users, GitBranch, StopCircle, FileText, Clock } from 'lucide-react'

// 开始节点
export const StartNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[70px] text-center transition-all
      ${selected ? 'border-blue-500 shadow-md' : 'border-green-500'}`}>
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      <div className="flex items-center justify-center gap-1">
        <PlayCircle className="w-3 h-3 text-green-500" />
        <span className="font-medium text-xs">{data.label || '开始'}</span>
      </div>
    </div>
  )
}

// 结束节点
export const EndNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[70px] text-center transition-all
      ${selected ? 'border-blue-500 shadow-md' : 'border-red-500'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <div className="flex items-center justify-center gap-1">
        <StopCircle className="w-3 h-3 text-red-500" />
        <span className="font-medium text-xs">{data.label || '结束'}</span>
      </div>
    </div>
  )
}

// 审批节点
export const ApproveNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[80px] text-center bg-blue-50 transition-all
      ${selected ? 'border-blue-500 shadow-md' : 'border-blue-300'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      <div className="flex items-center justify-center gap-1">
        <Users className="w-3 h-3 text-blue-600" />
        <span className="font-semibold text-xs text-blue-900">{data.label || '审批'}</span>
      </div>
      {data.assignees && data.assignees.length > 0 && (
        <div className="text-[10px] text-blue-700 mt-0.5 truncate max-w-[90px]">
          {data.assignees.length}人审批
        </div>
      )}
    </div>
  )
}

// 抄送节点
export const CcNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[80px] text-center bg-purple-50 transition-all
      ${selected ? 'border-purple-500 shadow-md' : 'border-purple-300'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      <div className="flex items-center justify-center gap-1">
        <FileText className="w-3 h-3 text-purple-600" />
        <span className="font-semibold text-xs text-purple-900">{data.label || '抄送'}</span>
      </div>
      {data.ccUsers && data.ccUsers.length > 0 && (
        <div className="text-[10px] text-purple-700 mt-0.5 truncate max-w-[90px]">
          {data.ccUsers.length}人抄送
        </div>
      )}
    </div>
  )
}

// 条件节点
export const ConditionNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[80px] text-center bg-orange-50 transition-all
      ${selected ? 'border-orange-500 shadow-md' : 'border-orange-300'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      <div className="flex items-center justify-center gap-1">
        <GitBranch className="w-3 h-3 text-orange-600" />
        <span className="font-semibold text-xs text-orange-900">{data.label || '条件'}</span>
      </div>
    </div>
  )
}

// 任务节点（通用）
export const TaskNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-3 py-1.5 rounded-md border-2 min-w-[80px] text-center bg-gray-50 transition-all
      ${selected ? 'border-gray-500 shadow-md' : 'border-gray-300'}`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      <div className="flex items-center justify-center gap-1">
        <Clock className="w-3 h-3 text-gray-600" />
        <span className="font-semibold text-xs text-gray-900">{data.label || '任务'}</span>
      </div>
    </div>
  )
}

// 节点类型映射
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  approve: ApproveNode,
  cc: CcNode,
  condition: ConditionNode,
  task: TaskNode,
}

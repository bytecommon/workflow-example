import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getStatusColor(status: number | string): string {
  // 兼容数字和字符串类型的status
  const statusStr = String(status).toUpperCase()

  // 字符串类型（后端返回）
  if (statusStr === 'RUNNING') {
    return 'bg-blue-100 text-blue-800'
  }
  if (statusStr === 'APPROVED') {
    return 'bg-green-100 text-green-800'
  }
  if (statusStr === 'REJECTED' || statusStr === 'CANCELED') {
    return 'bg-red-100 text-red-800'
  }
  if (statusStr === 'TERMINATED') {
    return 'bg-gray-100 text-gray-800'
  }
  // TaskVO 的状态
  if (statusStr === 'PENDING') {
    return 'bg-orange-100 text-orange-700'
  }
  if (statusStr === 'TRANSFERRED') {
    return 'bg-purple-100 text-purple-700'
  }

  // 数字类型（兼容旧代码）
  const statusNum = Number(status)
  switch (statusNum) {
    case 0: // 草稿
      return 'bg-gray-100 text-gray-800'
    case 1: // 运行中
      return 'bg-blue-100 text-blue-800'
    case 2: // 已完成
      return 'bg-green-100 text-green-800'
    case 3: // 已终止
      return 'bg-red-100 text-red-800'
    case 10: // 待处理
      return 'bg-yellow-100 text-yellow-800'
    case 11: // 已处理
      return 'bg-green-100 text-green-800'
    case 12: // 已转办
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusText(status: number | string): string {
  // 兼容数字和字符串类型的status
  const statusStr = String(status).toUpperCase()

  // 字符串类型（后端返回）
  if (statusStr === 'RUNNING') {
    return '运行中'
  }
  if (statusStr === 'APPROVED') {
    return '已同意'
  }
  if (statusStr === 'REJECTED') {
    return '已拒绝'
  }
  if (statusStr === 'CANCELED') {
    return '已取消'
  }
  if (statusStr === 'TERMINATED') {
    return '已终止'
  }
  // TaskVO 的状态
  if (statusStr === 'PENDING') {
    return '待处理'
  }
  if (statusStr === 'TRANSFERRED') {
    return '已转交'
  }

  // 数字类型（兼容旧代码）
  const statusNum = Number(status)
  switch (statusNum) {
    case 0: return '草稿'
    case 1: return '运行中'
    case 2: return '已完成'
    case 3: return '已终止'
    case 10: return '待处理'
    case 11: return '已处理'
    case 12: return '已转办'
    default: return '未知'
  }
}

export function getActionText(action: string): string {
  switch (action) {
    case 'START': return '启动流程'
    case 'APPROVE': return '审批通过'
    case 'REJECT': return '审批驳回'
    case 'TRANSFER': return '任务转办'
    case 'TERMINATE': return '终止流程'
    default: return action
  }
}
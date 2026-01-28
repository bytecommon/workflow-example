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
  const statusStr = String(status).toUpperCase()
  switch (statusStr) {
    // Workflow Definition 状态 (0/1)
    case '0':
      return 'bg-gray-100 text-gray-800'
    case '1':
      return 'bg-blue-100 text-blue-800'

    // Instance/Task 字符串状态
    case 'RUNNING':
      return 'bg-blue-100 text-blue-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'CANCELED':
      return 'bg-orange-100 text-orange-800'
    case 'TERMINATED':
      return 'bg-red-100 text-red-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'TRANSFERRED':
      return 'bg-purple-100 text-purple-800'

    // 旧的数字状态码（兼容）
    case '2':
      return 'bg-green-100 text-green-800'
    case '3':
      return 'bg-red-100 text-red-800'
    case '10':
      return 'bg-yellow-100 text-yellow-800'
    case '11':
      return 'bg-green-100 text-green-800'
    case '12':
      return 'bg-purple-100 text-purple-800'

    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusText(status: number | string): string {
  const statusStr = String(status).toUpperCase()
  switch (statusStr) {
    // Workflow Definition 状态
    case '0':
      return '停用'
    case '1':
      return '启用'

    // Instance/Task 字符串状态
    case 'RUNNING':
      return '运行中'
    case 'APPROVED':
      return '已同意'
    case 'REJECTED':
      return '已拒绝'
    case 'CANCELED':
      return '已取消'
    case 'TERMINATED':
      return '已终止'
    case 'PENDING':
      return '待处理'
    case 'TRANSFERRED':
      return '已转交'

    // 旧的数字状态码（兼容）
    case '2':
      return '已完成'
    case '3':
      return '已终止'
    case '10':
      return '待处理'
    case '11':
      return '已处理'
    case '12':
      return '已转办'

    default:
      return '未知'
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

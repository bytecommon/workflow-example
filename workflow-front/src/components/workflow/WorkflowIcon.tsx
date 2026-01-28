import React from 'react'
import { 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Building, 
  Users,
  Package,
  ClipboardCheck,
  CreditCard,
  Truck,
  FileCheck,
  Briefcase
} from 'lucide-react'

interface WorkflowIconProps {
  workflowKey: string
  className?: string
  size?: number
}

const iconMap: Record<string, React.ComponentType<any>> = {
  // 请假相关
  'LEAVE': Calendar,
  'LEAVE_APPLICATION': Calendar,
  
  // 财务相关
  'EXPENSE': DollarSign,
  'EXPENSE_APPLICATION': DollarSign,
  'REIMBURSEMENT': DollarSign,
  'FINANCE': DollarSign,
  'CREDIT_CARD': CreditCard,
  
  // 采购相关
  'PURCHASE': ShoppingCart,
  'PURCHASE_APPLICATION': ShoppingCart,
  'PROCUREMENT': ShoppingCart,
  
  // 文档相关
  'SEAL': FileText,
  'SEAL_APPLICATION': FileText,
  'DOCUMENT': FileText,
  'FILE': FileText,
  'FILE_CHECK': FileCheck,
  
  // 行政相关
  'ADMIN': Building,
  'HR': Users,
  'PERSONNEL': Users,
  
  // 其他
  'PACKAGE': Package,
  'APPROVAL': ClipboardCheck,
  'LOGISTICS': Truck,
  'BUSINESS': Briefcase
}

export const WorkflowIcon: React.FC<WorkflowIconProps> = ({ 
  workflowKey, 
  className = "h-5 w-5",
  size 
}) => {
  // 从 workflowKey 中提取关键词
  const key = workflowKey.toUpperCase()
  
  // 查找匹配的图标
  const IconComponent = Object.keys(iconMap).find(iconKey => 
    key.includes(iconKey)
  ) ? iconMap[Object.keys(iconMap).find(iconKey => key.includes(iconKey))!] : FileText

  return <IconComponent className={className} size={size} />
}
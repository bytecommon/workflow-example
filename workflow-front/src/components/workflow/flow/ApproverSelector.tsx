import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Badge } from '../../ui/badge'
import { Trash2, Plus, User, Users, Building2, Crown, Search } from 'lucide-react'
import { apiService } from '@/lib/apiService'
import { User as UserType, Department, Role } from '@/lib/api'

export interface Approver {
  id: string
  type: 'user' | 'role' | 'dept' | 'leader' | 'self' | 'form'
  value: string
  name: string
}

interface ApproverSelectorProps {
  approvers: Approver[]
  onChange: (approvers: Approver[]) => void
  label?: string
}

const approverTypeOptions = [
  { value: 'user', label: '指定用户', icon: User },
  { value: 'role', label: '指定角色', icon: Crown },
  { value: 'dept', label: '指定部门', icon: Building2 },
  { value: 'leader', label: '上级领导', icon: Users },
  { value: 'self', label: '发起人', icon: User },
  { value: 'form', label: '表单字段', icon: User },
]

export function ApproverSelector({ approvers, onChange, label = '审批人' }: ApproverSelectorProps) {
  const [users, setUsers] = useState<UserType[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, deptsRes, rolesRes] = await Promise.all([
        apiService.user.getUsers(),
        apiService.user.getDepartments(),
        apiService.user.getRoles()
      ])
      if (usersRes.code === 200) setUsers(usersRes.data)
      if (deptsRes.code === 200) setDepartments(deptsRes.data)
      if (rolesRes.code === 200) setRoles(rolesRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddApprover = () => {
    const newApprover: Approver = {
      id: `approver_${Date.now()}`,
      type: 'user',
      value: '',
      name: ''
    }
    onChange([...approvers, newApprover])
  }

  const handleRemoveApprover = (index: number) => {
    onChange(approvers.filter((_, i) => i !== index))
  }

  const handleUpdateApprover = (index: number, updates: Partial<Approver>) => {
    const updated = [...approvers]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const getApproverTypeIcon = (type: string) => {
    const option = approverTypeOptions.find(o => o.value === type)
    const Icon = option?.icon || User
    return <Icon className="w-3 h-3" />
  }

  const getApproverTypeLabel = (type: string) => {
    return approverTypeOptions.find(o => o.value === type)?.label || type
  }

  const renderValueSelector = (approver: Approver, index: number) => {
    switch (approver.type) {
      case 'user':
        return (
          <Select
            value={approver.value}
            onValueChange={(value) => {
              const user = users.find(u => u.username === value)
              handleUpdateApprover(index, {
                value,
                name: user?.realName || value
              })
            }}
          >
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="选择用户" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  placeholder="搜索用户"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-7 text-xs mb-2"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {users
                .filter(u =>
                  u.realName.includes(userSearch) ||
                  u.username.includes(userSearch)
                )
                .map(user => (
                  <SelectItem key={user.username} value={user.username} className="text-xs">
                    {user.realName} ({user.username})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )

      case 'role':
        return (
          <Select
            value={approver.value}
            onValueChange={(value) => {
              const role = roles.find(r => r.code === value)
              handleUpdateApprover(index, {
                value,
                name: role?.name || value
              })
            }}
          >
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="选择角色" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.code} value={role.code} className="text-xs">
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'dept':
        return (
          <Select
            value={approver.value}
            onValueChange={(value) => {
              const dept = departments.find(d => d.name === value)
              handleUpdateApprover(index, {
                value,
                name: dept?.name || value
              })
            }}
          >
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue placeholder="选择部门" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept.name} value={dept.name} className="text-xs">
                  {dept.name} ({dept.userCount}人)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'leader':
        return (
          <Select
            value={approver.value || 'direct'}
            onValueChange={(value) => handleUpdateApprover(index, { value, name: '上级领导' })}
          >
            <SelectTrigger className="w-full h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct" className="text-xs">直属上级</SelectItem>
              <SelectItem value="dept" className="text-xs">部门负责人</SelectItem>
              <SelectItem value="all" className="text-xs">逐级上级</SelectItem>
            </SelectContent>
          </Select>
        )

      case 'self':
        return (
          <div className="text-xs text-muted-foreground py-1 px-2 bg-muted rounded">
            流程发起人自己
          </div>
        )

      case 'form':
        return (
          <Input
            value={approver.value}
            onChange={(e) => handleUpdateApprover(index, { value: e.target.value, name: e.target.value })}
            placeholder="输入表单字段名"
            className="h-7 text-xs"
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddApprover}
          className="h-6 text-blue-600 text-xs px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          添加
        </Button>
      </div>

      {approvers && approvers.length > 0 ? (
        <div className="space-y-1">
          {approvers.map((approver, index) => (
            <div key={approver.id} className="flex gap-1 items-start p-1.5 bg-muted/50 rounded">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1">
                  <Select
                    value={approver.type}
                    onValueChange={(value) => handleUpdateApprover(index, {
                      type: value as any,
                      value: '',
                      name: ''
                    })}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs">
                      <div className="flex items-center gap-1">
                        {getApproverTypeIcon(approver.type)}
                        <span className="text-[10px]">{getApproverTypeLabel(approver.type)}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {approverTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          <div className="flex items-center gap-2">
                            <option.icon className="w-3 h-3" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-0.5">
                  {renderValueSelector(approver, index)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveApprover(index)}
                className="h-7 w-7 text-red-600 hover:bg-red-50 p-0 shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground text-center py-2 bg-muted/30 rounded">
          暂无{label}
        </div>
      )}
    </div>
  )
}

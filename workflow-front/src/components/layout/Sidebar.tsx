import React from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  LayoutDashboard,
  Layers,
  GitBranch,
  CheckSquare,
  Search,
  LogOut,
  Workflow,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  activeTab: 'dashboard' | 'templates' | 'workflows' | 'tasks' | 'instances'
  onTabChange: (tab: 'dashboard' | 'templates' | 'workflows' | 'tasks' | 'instances') => void
  currentUser?: any
  onLogout?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const menuItems = [
  { id: 'dashboard' as const, label: '工作台', icon: LayoutDashboard },
  { id: 'templates' as const, label: '流程模板', icon: Layers },
  { id: 'workflows' as const, label: '流程管理', icon: GitBranch },
  { id: 'tasks' as const, label: '我的待办', icon: CheckSquare },
  { id: 'instances' as const, label: '流程查询', icon: Search },
]

export function Sidebar({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 bg-card border-r transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo 区域 */}
      <div className="h-16 flex items-center justify-center border-b">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <Workflow className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">工作流系统</h1>
              <p className="text-xs text-muted-foreground">审批管理平台</p>
            </div>
          </div>
        ) : (
          <Workflow className="w-6 h-6 text-primary" />
        )}
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* 间隔空间 - 让用户区域远离菜单部分 */}
      <div className="flex-shrink-0 px-2 pb-2">
        <div className="h-8 bg-transparent"></div>
      </div>

      {/* 用户信息和退出按钮 - 位于菜单栏左下角 */}
      <div className="p-3 border-t">
        {!collapsed && currentUser && (
          <div className="mb-3">
            <Card className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {currentUser.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between">
          {!collapsed && currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex-1 justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}

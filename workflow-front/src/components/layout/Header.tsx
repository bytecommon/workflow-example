import React from 'react'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface HeaderProps {
  activeTab: 'dashboard' | 'workflows' | 'tasks' | 'instances'
  onTabChange: (tab: 'dashboard' | 'workflows' | 'tasks' | 'instances') => void
  currentUser?: any
  onLogout?: () => void
}

export function Header({ activeTab, onTabChange, currentUser, onLogout }: HeaderProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">工作流审批系统</h1>
            <span className="text-sm text-muted-foreground">企业级流程管理平台</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{currentUser.name}</span>
                <span className="mx-2">•</span>
                <span>{currentUser.role}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </div>
        
        <div className="pb-2">
          <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)}>
            <TabsList className="flex w-full space-x-1">
              <TabsTrigger value="dashboard" className="flex-1">工作台</TabsTrigger>
              <TabsTrigger value="workflows" className="flex-1">流程管理</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1">我的待办</TabsTrigger>
              <TabsTrigger value="instances" className="flex-1">流程查询</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  )
}
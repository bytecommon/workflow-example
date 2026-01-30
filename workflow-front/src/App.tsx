import React, { useState, useEffect } from 'react'
import { Dashboard } from './components/dashboard/Dashboard'
import { WorkflowList } from './components/workflow/WorkflowList'
import { TaskList } from './components/task/TaskList'
import { InstanceList } from './components/instance/InstanceList'
import { Header } from './components/layout/Header'
import { LoginPage } from './components/auth/LoginPage'
import { login, isAuthenticated, getCurrentUser, initializeAuth } from './lib/auth'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/ui/toast'

type ActiveTab = 'dashboard' | 'workflows' | 'tasks' | 'instances'

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toasts, removeToast } = useToast()

  // 初始化认证状态
  useEffect(() => {
    initializeAuth()
    setIsLoggedIn(isAuthenticated())
    setCurrentUser(getCurrentUser())
  }, [])

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const success = await login(username, password)
    if (success) {
      setIsLoggedIn(true)
      setCurrentUser(getCurrentUser())
    }
    return success
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />
      case 'workflows':
        return <WorkflowList currentUser={currentUser} />
      case 'tasks':
        return <TaskList currentUser={currentUser} />
      case 'instances':
        return <InstanceList currentUser={currentUser} />
      default:
        return <Dashboard currentUser={currentUser} />
    }
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}

export default App
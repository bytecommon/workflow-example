// 用户认证服务
export interface User {
  id: string
  username: string
  name: string
  role: string
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 'user001',
    username: 'user001',
    name: '张三',
    role: '管理员'
  },
  {
    id: 'user002', 
    username: 'user002',
    name: '李四',
    role: '普通用户'
  },
  {
    id: 'user003',
    username: 'user003',
    name: '王五',
    role: '普通用户'
  }
]

// 当前登录用户状态
let currentUser: User | null = null

// 检查是否已登录
export function isAuthenticated(): boolean {
  return currentUser !== null
}

// 获取当前用户
export function getCurrentUser(): User | null {
  return currentUser
}

// 登录函数
export async function login(username: string, password: string): Promise<boolean> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 简单的模拟认证 - 只要用户名存在于用户列表即可
  const user = mockUsers.find(u => u.username === username)
  
  if (user) {
    currentUser = user
    // 存储到localStorage以便页面刷新后保持登录状态
    localStorage.setItem('currentUser', JSON.stringify(user))
    return true
  }
  
  return false
}

// 登出函数
export function logout(): void {
  currentUser = null
  localStorage.removeItem('currentUser')
}

// 初始化认证状态（页面刷新时恢复登录状态）
export function initializeAuth(): void {
  const storedUser = localStorage.getItem('currentUser')
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser)
    } catch (error) {
      console.error('解析存储的用户信息失败:', error)
      localStorage.removeItem('currentUser')
    }
  }
}
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Play, 
  Pause, 
  Square, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import { WorkflowDefinition } from '@/lib/api'

interface WorkflowPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflow: WorkflowDefinition | null
}

interface WorkflowNode {
  id: string
  name: string
  type: 'start' | 'end' | 'task' | 'approval' | 'decision' | 'parallel'
  x: number
  y: number
  status?: 'pending' | 'active' | 'completed' | 'skipped'
  assignees?: string[]
  conditions?: string[]
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
  condition?: string
}

export function WorkflowPreview({ open, onOpenChange, workflow }: WorkflowPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [animation, setAnimation] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // 模拟流程节点数据
  const workflowNodes: WorkflowNode[] = [
    { id: 'start', name: '开始', type: 'start', x: 100, y: 200, status: 'completed' },
    { id: 'apply', name: '提交申请', type: 'task', x: 250, y: 200, status: 'completed' },
    { id: 'dept_approve', name: '部门审批', type: 'approval', x: 400, y: 150, assignees: ['部门经理'], status: 'active' },
    { id: 'hr_approve', name: 'HR审批', type: 'approval', x: 400, y: 250, assignees: ['HR经理'], status: 'pending' },
    { id: 'final_approve', name: '最终审批', type: 'approval', x: 550, y: 200, assignees: ['总经理'], status: 'pending' },
    { id: 'end', name: '结束', type: 'end', x: 700, y: 200, status: 'pending' }
  ]

  const workflowEdges: WorkflowEdge[] = [
    { id: 'e1', source: 'start', target: 'apply' },
    { id: 'e2', source: 'apply', target: 'dept_approve' },
    { id: 'e3', source: 'apply', target: 'hr_approve' },
    { id: 'e4', source: 'dept_approve', target: 'final_approve' },
    { id: 'e5', source: 'hr_approve', target: 'final_approve' },
    { id: 'e6', source: 'final_approve', target: 'end' }
  ]

  useEffect(() => {
    if (open && workflow) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setAnimation(false)
      setCurrentStep(0)
    }
  }, [open, workflow])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleStartAnimation = () => {
    setAnimation(true)
    setCurrentStep(0)
    
    const steps = workflowNodes.filter(node => node.type !== 'start' && node.type !== 'end').length
    let step = 0
    
    const interval = setInterval(() => {
      step++
      setCurrentStep(step)
      
      if (step >= steps) {
        clearInterval(interval)
        setTimeout(() => {
          setAnimation(false)
        }, 1000)
      }
    }, 1000)
  }

  const handleStopAnimation = () => {
    setAnimation(false)
    setCurrentStep(0)
  }

  const handleDownload = () => {
    if (!workflow) return
    
    // 创建SVG内容
    const svgContent = generateSVG()
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${workflow.workflowKey}_workflow.svg`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const generateSVG = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="3" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#666" />
    </marker>
  </defs>
  
  <!-- 节点 -->
  ${workflowNodes.map(node => {
    const width = 120
    const height = 60
    const rx = 8
    
    let fill = '#f3f4f6'
    if (node.type === 'start' || node.type === 'end') fill = '#10b981'
    if (node.type === 'approval') fill = '#3b82f6'
    if (node.type === 'task') fill = '#f59e0b'
    
    return `
    <rect x="${node.x}" y="${node.y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="#d1d5db" stroke-width="2"/>
    <text x="${node.x + width/2}" y="${node.y + height/2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#374151">${node.name}</text>
    `
  }).join('')}
  
  <!-- 连线 -->
  ${workflowEdges.map(edge => {
    const source = workflowNodes.find(n => n.id === edge.source)!
    const target = workflowNodes.find(n => n.id === edge.target)!
    
    const x1 = source.x + 120
    const y1 = source.y + 30
    const x2 = target.x
    const y2 = target.y + 30
    
    return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#666" stroke-width="2" marker-end="url(#arrow)"/>
    `
  }).join('')}
</svg>`
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start':
      case 'end': return <Play className="w-4 h-4" />
      case 'approval': return <Users className="w-4 h-4" />
      case 'task': return <CheckCircle className="w-4 h-4" />
      case 'decision': return <Clock className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const getNodeColor = (type: string, status?: string) => {
    if (status === 'active') return 'bg-blue-500 text-white border-blue-600'
    if (status === 'completed') return 'bg-green-500 text-white border-green-600'
    if (status === 'skipped') return 'bg-gray-400 text-white border-gray-500'
    
    switch (type) {
      case 'start':
      case 'end': return 'bg-green-100 text-green-800 border-green-300'
      case 'approval': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'task': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'decision': return 'bg-purple-100 text-purple-800 border-purple-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (!workflow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>流程预览 - {workflow.workflowName}</span>
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                导出SVG
              </Button>
              
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1">
                {!animation ? (
                  <Button variant="outline" size="sm" onClick={handleStartAnimation}>
                    <Play className="w-4 h-4 mr-2" />
                    演示流程
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleStopAnimation}>
                    <Square className="w-4 h-4 mr-2" />
                    停止演示
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex h-[600px]">
          {/* 流程图画布 */}
          <div className="flex-1 border rounded-lg overflow-hidden relative">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: '0 0',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* 网格背景 */}
              <svg className="absolute inset-0 w-full h-full" style={{ backgroundSize: '20px 20px' }}>
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              
              {/* 流程节点和连线 */}
              <svg className="absolute inset-0 w-full h-full">
                {/* 连线 */}
                {workflowEdges.map(edge => {
                  const source = workflowNodes.find(n => n.id === edge.source)!
                  const target = workflowNodes.find(n => n.id === edge.target)!
                  
                  const x1 = source.x + 120
                  const y1 = source.y + 30
                  const x2 = target.x
                  const y2 = target.y + 30
                  
                  // 计算控制点用于曲线
                  const controlX = (x1 + x2) / 2
                  const controlY1 = y1
                  const controlY2 = y2
                  
                  return (
                    <g key={edge.id}>
                      <path
                        d={`M ${x1} ${y1} C ${controlX} ${controlY1}, ${controlX} ${controlY2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                      </defs>
                    </g>
                  )
                })}
                
                {/* 节点 */}
                {workflowNodes.map(node => (
                  <g key={node.id}>
                    <rect
                      x={node.x}
                      y={node.y}
                      width={120}
                      height={60}
                      rx={8}
                      className={`${getNodeColor(node.type, node.status)} border-2 transition-all duration-300 ${
                        animation && node.status === 'active' ? 'animate-pulse ring-2 ring-blue-400' : ''
                      }`}
                    />
                    <foreignObject x={node.x} y={node.y} width={120} height={60}>
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <div className="flex items-center space-x-1 mb-1">
                          {getNodeIcon(node.type)}
                          <span className={`text-sm font-medium text-center ${
                            node.status === 'active' || node.status === 'completed' || node.status === 'skipped' 
                              ? 'text-white' 
                              : ''
                          }`}>{node.name}</span>
                        </div>
                        {node.assignees && (
                          <div className={`text-xs text-center ${
                            node.status === 'active' || node.status === 'completed' || node.status === 'skipped' 
                              ? 'text-gray-200' 
                              : 'text-gray-600'
                          }`}>
                            {node.assignees.join(', ')}
                          </div>
                        )}
                        {node.status && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {node.status === 'active' ? '进行中' : 
                             node.status === 'completed' ? '已完成' : 
                             node.status === 'pending' ? '待处理' : '已跳过'}
                          </Badge>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>
          </div>
          
          {/* 侧边栏信息 */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">流程信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">名称:</span>
                    <span className="text-sm font-medium">{workflow.workflowName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">关键字:</span>
                    <code className="text-sm bg-gray-100 px-1 rounded">{workflow.workflowKey}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">版本:</span>
                    <span className="text-sm font-medium">v{workflow.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">状态:</span>
                    <Badge variant={workflow.status === 1 ? "default" : "outline"}>
                      {workflow.status === 1 ? '已启用' : '未启用'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">节点说明</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workflowNodes.map(node => (
                    <div key={node.id} className="flex items-start space-x-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center mt-0.5 ${getNodeColor(node.type)}`}>
                        {getNodeIcon(node.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{node.name}</div>
                        <div className="text-xs text-gray-600">
                          类型: {node.type === 'start' ? '开始节点' :
                               node.type === 'end' ? '结束节点' :
                               node.type === 'approval' ? '审批节点' :
                               node.type === 'task' ? '任务节点' : '决策节点'}
                        </div>
                        {node.assignees && (
                          <div className="text-xs text-gray-500">
                            处理人: {node.assignees.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">流程统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">总节点数:</span>
                    <span className="text-sm font-medium">{workflowNodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">审批节点:</span>
                    <span className="text-sm font-medium">
                      {workflowNodes.filter(n => n.type === 'approval').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">任务节点:</span>
                    <span className="text-sm font-medium">
                      {workflowNodes.filter(n => n.type === 'task').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">预计耗时:</span>
                    <span className="text-sm font-medium">3-5天</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
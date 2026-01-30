import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Play,
  Square,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  HelpCircle,
  FileEdit,
  GitBranch,
  CircleDot,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  FileText,
  Send,
  Flag
} from 'lucide-react'
import { WorkflowDefinition, WorkflowDetailVO } from '@/lib/api'
import { apiService } from '@/lib/apiService'

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

// 默认流程节点数据 - 优化布局
const defaultWorkflowNodes: WorkflowNode[] = [
  { id: 'start', name: '开始', type: 'start', x: 50, y: 200, status: 'pending' },
  { id: 'apply', name: '提交申请', type: 'task', x: 200, y: 200, status: 'pending' },
  { id: 'dept_approve', name: '部门审批', type: 'approval', x: 370, y: 130, assignees: ['部门经理'], status: 'pending' },
  { id: 'hr_approve', name: 'HR审批', type: 'approval', x: 370, y: 270, assignees: ['HR经理'], status: 'pending' },
  { id: 'final_approve', name: '最终审批', type: 'approval', x: 540, y: 200, assignees: ['总经理'], status: 'pending' },
  { id: 'end', name: '结束', type: 'end', x: 710, y: 200, status: 'pending' }
]

export function WorkflowPreview({ open, onOpenChange, workflow }: WorkflowPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [animation, setAnimation] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [nodes, setNodes] = useState<WorkflowNode[]>(defaultWorkflowNodes)
  const [edges, setEdges] = useState<WorkflowEdge[]>([
    { id: 'e1', source: 'start', target: 'apply' },
    { id: 'e2', source: 'apply', target: 'dept_approve' },
    { id: 'e3', source: 'apply', target: 'hr_approve' },
    { id: 'e4', source: 'dept_approve', target: 'final_approve' },
    { id: 'e5', source: 'hr_approve', target: 'final_approve' },
    { id: 'e6', source: 'final_approve', target: 'end' }
  ])

  // 模拟流程节点数据 - 优化布局
  const workflowNodes: WorkflowNode[] = defaultWorkflowNodes

  const defaultWorkflowEdges: WorkflowEdge[] = [
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
      setPosition({ x: 50, y: 50 })
      setAnimation(false)
      // 加载流程图数据
      loadWorkflowGraph(workflow.id)
    }
  }, [open, workflow])

  // 映射后台节点类型到前端节点类型
  const mapNodeType = (nodeType: string): 'start' | 'end' | 'task' | 'approval' | 'decision' => {
    switch (nodeType) {
      case 'START': return 'start'
      case 'END': return 'end'
      case 'APPROVE': return 'approval'
      case 'CC': return 'task'
      case 'CONDITION': return 'decision'
      default: return 'task'
    }
  }

  // 加载流程图数据
  const loadWorkflowGraph = async (workflowId: number) => {
    try {
      const response = await apiService.workflow.getWorkflowDetail(workflowId)
      console.log('流程图数据响应:', response)

      if (response.code === 200 && response.data) {
        const graphData = response.data as WorkflowDetailVO
        console.log('解析后的流程图数据:', graphData)

        // 加载节点数据
        if (graphData.nodes && graphData.nodes.length > 0) {
          console.log('加载节点，数量:', graphData.nodes.length)
          console.log('原始节点数据:', graphData.nodes)
          const newNodes = graphData.nodes.map((node: any, index: number) => {
            console.log(`处理节点[${index}]:`, node, 'id:', node.id, 'nodeName:', node.nodeName)
            // 映射后台字段到前端字段
            const processedNode = {
              id: String(node.id),
              name: node.nodeName || '未命名节点',
              type: mapNodeType(node.nodeType || 'TASK'),
              x: typeof node.positionX === 'number' ? node.positionX : 0,
              y: typeof node.positionY === 'number' ? node.positionY : 0,
              status: 'pending' as const,
              assignees: [],
              conditions: []
            }
            console.log(`处理后节点[${index}]:`, processedNode)
            return processedNode
          })
          console.log('设置节点数据:', newNodes, '节点数量:', newNodes.length)
          setNodes(newNodes)
        } else {
          console.log('使用默认节点数据')
          // 使用默认节点数据
          const defaultNodes = workflowNodes.map(node => ({
            ...node,
            status: 'pending' as const
          }))
          setNodes(defaultNodes)
        }

        // 加载连线数据
        if (graphData.edges && graphData.edges.length > 0) {
          console.log('加载连线，数量:', graphData.edges.length)
          console.log('原始连线数据:', graphData.edges)
          const newEdges = graphData.edges.map((edge: any, index: number) => {
            console.log(`处理连线[${index}]:`, edge)
            return {
              id: String(edge.id),
              source: String(edge.sourceNodeId),
              target: String(edge.targetNodeId),
              label: edge.conditionExpr || '',
              condition: edge.conditionExpr || ''
            }
          })
          console.log('设置连线数据:', newEdges)
          setEdges(newEdges)
        } else {
          console.log('使用默认连线数据')
          // 使用默认连线数据
          setEdges(defaultWorkflowEdges)
        }
      } else {
        console.log('响应没有数据，使用默认数据')
        // 没有返回数据，使用默认数据
        const defaultNodes = workflowNodes.map(node => ({
          ...node,
          status: 'pending' as const
        }))
        setNodes(defaultNodes)
        setEdges(defaultWorkflowEdges)
      }
    } catch (error) {
      console.error('加载流程图数据失败:', error)
      // 使用默认数据
      const defaultNodes = workflowNodes.map(node => ({
        ...node,
        status: 'pending' as const
      }))
      setNodes(defaultNodes)
      setEdges(defaultWorkflowEdges)
    }
  }

  // 重置节点状态为初始状态
  const resetNodes = () => {
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        status: 'pending' as const
      }))
    )
  }

  // 获取节点流转顺序（根据连线动态计算）
  const getNodeFlowOrder = (): string[] => {
    // 根据连线构建流转顺序
    const nodeMap = new Map<string, string>()
    const startNodes = nodes.filter(n => n.type === 'start')

    // 构建节点流转映射
    edges.forEach(edge => {
      nodeMap.set(edge.source, edge.target)
    })

    // 从开始节点开始追踪流转
    const flowOrder: string[] = []
    const visited = new Set<string>()

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId) || flowOrder.length >= nodes.length) return

      flowOrder.push(nodeId)
      visited.add(nodeId)

      const nextNodeId = nodeMap.get(nodeId)
      if (nextNodeId) {
        traverse(nextNodeId)
      }
    }

    // 从所有开始节点开始遍历
    startNodes.forEach(startNode => {
      if (!visited.has(startNode.id)) {
        traverse(startNode.id)
      }
    })

    // 如果没有连线数据，回退到按 x 坐标排序
    if (flowOrder.length === 0) {
      return nodes
        .filter(node => node.type !== 'decision' && node.type !== 'parallel')
        .sort((a, b) => a.x - b.x)
        .map(node => node.id)
    }

    return flowOrder
  }

  // 拖动相关事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    // 只允许左键拖动
    if (e.button !== 0) return

    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // 处理滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta))
    setZoom(newZoom)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 50, y: 50 })
  }

  const handleStartAnimation = () => {
    setAnimation(true)
    resetNodes()

    const flowOrder = getNodeFlowOrder()
    let step = 0

    // 立即设置开始节点为已完成
    const updatedNodes = nodes.map(node => {
      if (node.id === flowOrder[0]) {
        return { ...node, status: 'completed' as const }
      }
      return node
    })
    setNodes(updatedNodes)

    const interval = setInterval(() => {
      step++

      if (step < flowOrder.length) {
        // 当前节点完成
        const currentNodeId = flowOrder[step]
        const prevNodeId = flowOrder[step - 1]

        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id === prevNodeId) {
              return { ...node, status: 'completed' as const }
            }
            if (node.id === currentNodeId) {
              return { ...node, status: 'active' as const }
            }
            return node
          })
        )
      } else if (step === flowOrder.length) {
        // 最后一个节点完成
        clearInterval(interval)
        setNodes(prevNodes =>
          prevNodes.map(node => ({
            ...node,
            status: node.type === 'end' ? 'completed' : node.status
          }))
        )
        setTimeout(() => {
          setAnimation(false)
          // 自动重置节点状态到初始状态
          resetNodes()
        }, 1500)
      }
    }, 1200)
  }

  const handleStopAnimation = () => {
    setAnimation(false)
    resetNodes()
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
    <marker id="arrow" viewBox="0 0 6 4.5" refX="5.5" refY="2.25" markerUnits="strokeWidth" markerWidth="6" markerHeight="4.5" orient="auto">
      <polygon points="0 0, 6 2.25, 0 4.5" fill="#666" />
    </marker>
  </defs>

  <!-- 节点 -->
  ${nodes.map(node => {
    const width = 120
    const height = 60
    const rx = 8
    const colors = getNodeColor(node.type, node.status)

    return `
    <rect x="${node.x}" y="${node.y}" width="${width}" height="${height}" rx="${rx}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="2"/>
    <text x="${node.x + width/2}" y="${node.y + height/2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="${colors.text}">${node.name}</text>
    `
  }).join('')}

  <!-- 连线 -->
  ${edges.map(edge => {
    const source = nodes.find(n => n.id === edge.source)
    const target = nodes.find(n => n.id === edge.target)

    // 安全检查，如果找不到源节点或目标节点，跳过该连线
    if (!source || !target) return ''

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
        return <Play className="w-4 h-4" fill="currentColor" />
      case 'end':
        return <Flag className="w-4 h-4" fill="currentColor" />
      case 'approval':
        return <UserCheck className="w-4 h-4" />
      case 'task':
        return <FileEdit className="w-4 h-4" />
      case 'decision':
        return <GitBranch className="w-4 h-4" />
      case 'parallel':
        return <CircleDot className="w-4 h-4" />
      case 'gateway':
        return <AlertCircle className="w-4 h-4" />
      case 'notification':
        return <Send className="w-4 h-4" />
      case 'script':
        return <FileText className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getNodeColor = (type: string, status?: string) => {
    // 状态优先
    if (status === 'active') {
      return {
        bg: '#3b82f6',
        border: '#2563eb',
        text: '#ffffff',
        shadow: 'rgba(59, 130, 246, 0.3)'
      }
    }
    if (status === 'completed') {
      return {
        bg: '#10b981',
        border: '#059669',
        text: '#ffffff',
        shadow: 'rgba(16, 185, 129, 0.3)'
      }
    }
    if (status === 'skipped') {
      return {
        bg: '#9ca3af',
        border: '#6b7280',
        text: '#ffffff',
        shadow: 'rgba(156, 163, 175, 0.3)'
      }
    }

    // 节点类型样式
    switch (type) {
      case 'start':
        return {
          bg: '#ecfdf5',
          border: '#10b981',
          text: '#065f46',
          shadow: 'rgba(16, 185, 129, 0.1)'
        }
      case 'end':
        return {
          bg: '#f0fdf4',
          border: '#22c55e',
          text: '#166534',
          shadow: 'rgba(34, 197, 94, 0.1)'
        }
      case 'approval':
        return {
          bg: '#eff6ff',
          border: '#3b82f6',
          text: '#1e40af',
          shadow: 'rgba(59, 130, 246, 0.1)'
        }
      case 'task':
        return {
          bg: '#fefce8',
          border: '#eab308',
          text: '#854d0e',
          shadow: 'rgba(234, 179, 8, 0.1)'
        }
      case 'decision':
        return {
          bg: '#faf5ff',
          border: '#a855f7',
          text: '#6b21a8',
          shadow: 'rgba(168, 85, 247, 0.1)'
        }
      default:
        return {
          bg: '#f9fafb',
          border: '#9ca3af',
          text: '#374151',
          shadow: 'rgba(156, 163, 175, 0.1)'
        }
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

              <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 rounded-lg px-2 py-1 text-xs">
                <Move className="w-3 h-3 mr-1" />
                拖动移动
              </div>

              <div className="flex items-center space-x-1 bg-gray-50 text-gray-600 rounded-lg px-2 py-1 text-xs">
                <HelpCircle className="w-3 h-3 mr-1" />
                滚轮缩放
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
          <div
            className={`flex-1 border rounded-lg relative overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
            <div
              className="absolute bg-gradient-to-br from-gray-50 to-gray-100"
              style={{
                width: '4000px',
                height: '3000px',
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
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
              <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                {/* 连线 - 放在节点下方 */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="6"
                    markerHeight="4.5"
                    refX="5.5"
                    refY="2.25"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 2.25, 0 4.5" fill="#9ca3af" />
                  </marker>
                </defs>

                {edges.map(edge => {
                  const source = nodes.find(n => n.id === edge.source)
                  const target = nodes.find(n => n.id === edge.target)

                  // 安全检查，如果找不到源节点或目标节点，跳过该连线
                  if (!source || !target) return null

                  const x1 = source.x + 130
                  const y1 = source.y + 30
                  const x2 = target.x
                  const y2 = target.y + 30

                  // 计算控制点用于平滑曲线
                  const controlX = (x1 + x2) / 2

                  return (
                    <path
                      key={edge.id}
                      d={`M ${x1} ${y1} C ${controlX} ${y1}, ${controlX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      style={{
                        transition: 'stroke 0.2s'
                      }}
                    />
                  )
                })}

                {/* 节点 */}
                {(() => { console.log('渲染节点，数量:', nodes.length, '节点数据:', nodes); return null; })()}
                {nodes.map((node, index) => {
                  console.log(`渲染节点[${index}]:`, node)
                  const colors = getNodeColor(node.type, node.status)
                  const isActive = animation && node.status === 'active'

                  return (
                    <g key={node.id}>
                      {/* 节点阴影 */}
                      <rect
                        x={node.x + 2}
                        y={node.y + 2}
                        width={130}
                        height={60}
                        rx={10}
                        fill="transparent"
                        stroke={colors.shadow}
                        strokeWidth="0"
                        style={{
                          filter: `drop-shadow(0 4px 6px ${colors.shadow})`
                        }}
                      />

                      {/* 节点主体 */}
                      <rect
                        x={node.x}
                        y={node.y}
                        width={130}
                        height={60}
                        rx={10}
                        fill={colors.bg}
                        stroke={colors.border}
                        strokeWidth="2"
                        style={{
                          transition: 'all 0.2s ease',
                          filter: isActive ? `drop-shadow(0 0 12px ${colors.shadow})` : `drop-shadow(0 2px 4px ${colors.shadow})`
                        }}
                      />

                      {/* 节点内容 */}
                      <foreignObject x={node.x} y={node.y} width={130} height={60}>
                        <div className="flex flex-col items-center justify-center h-full px-2">
                          <div className="flex items-center justify-center space-x-1.5 mb-0.5">
                            <div style={{ color: colors.text }}>
                              {getNodeIcon(node.type)}
                            </div>
                            <span
                              className="text-sm font-semibold text-center"
                              style={{ color: colors.text }}
                            >
                              {node.name}
                            </span>
                          </div>

                          {/* 审批人/处理人 */}
                          {node.assignees && node.assignees.length > 0 && (
                            <div
                              className="text-xs text-center truncate max-w-[120px]"
                              style={{ color: node.status === 'completed' || node.status === 'active' ? 'rgba(255,255,255,0.9)' : '#6b7280' }}
                            >
                              {node.assignees.join(', ')}
                            </div>
                          )}

                          {/* 状态标签 - 只在活跃或完成时显示 */}
                          {node.status && node.status !== 'pending' && (
                            <div
                              className="text-[10px] px-1.5 py-0.5 rounded mt-0.5 inline-block"
                              style={{
                                backgroundColor: node.status === 'active' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
                                color: colors.text
                              }}
                            >
                              {node.status === 'active' ? '进行中' :
                               node.status === 'completed' ? '已完成' : '已跳过'}
                            </div>
                          )}
                        </div>
                      </foreignObject>

                      {/* 活跃状态指示器 */}
                      {isActive && (
                        <circle
                          cx={node.x + 130 - 8}
                          cy={node.y + 8}
                          r={6}
                          fill={colors.border}
                          style={{
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }}
                        >
                          <animate
                            attributeName="r"
                            values="6;10;6"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="1;0.5;1"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  )
                })}
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
                  {nodes.map(node => {
                    const colors = getNodeColor(node.type, node.status)
                    return (
                      <div key={node.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: colors.bg,
                            border: `1.5px solid ${colors.border}`
                          }}
                        >
                          <div style={{ color: colors.text, fontSize: '14px' }}>
                            {getNodeIcon(node.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">{node.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {node.type === 'start' ? '开始节点' :
                             node.type === 'end' ? '结束节点' :
                             node.type === 'approval' ? '审批节点' :
                             node.type === 'task' ? '任务节点' : '决策节点'}
                          </div>
                          {node.assignees && node.assignees.length > 0 && (
                            <div className="text-xs text-gray-600 truncate">
                              处理人: {node.assignees.join(', ')}
                            </div>
                          )}
                          {node.status && node.status !== 'pending' && (
                            <div className="text-xs mt-1">
                              <span
                                className="px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: node.status === 'active' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: colors.text
                                }}
                              >
                                {node.status === 'active' ? '进行中' :
                                 node.status === 'completed' ? '已完成' : '已跳过'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">流程统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">总节点数:</span>
                    <span className="text-sm font-medium">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">审批节点:</span>
                    <span className="text-sm font-medium">
                      {nodes.filter(n => n.type === 'approval').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">任务节点:</span>
                    <span className="text-sm font-medium">
                      {nodes.filter(n => n.type === 'task').length}
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
import React, { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  NodeDragHandler,
  SelectionChangeParams,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from './NodeTypes'
import { edgeTypes } from './EdgeTypes'
import { NodePropertiesPanel } from './NodePropertiesPanel'
import { EdgePropertiesPanel } from './EdgePropertiesPanel'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import {
  Plus,
  Save,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  Users,
  GitBranch,
  FileText,
  Clock,
} from 'lucide-react'

interface FlowDesignerProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onChange?: (nodes: Node[], edges: Edge[]) => void
  readOnly?: boolean
}

export function FlowDesigner({
  initialNodes = [],
  initialEdges = [],
  onChange,
  readOnly = false,
}: FlowDesignerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // 只在初始化时加载初始数据
  React.useEffect(() => {
    if (!isInitialized) {
      // 检查节点数据是否有效
      const validNodes = initialNodes?.filter(node =>
        node &&
        node.id &&
        node.position &&
        typeof node.position.x === 'number' &&
        typeof node.position.y === 'number'
      ) || []

      // 检查边数据是否有效
      const validEdges = initialEdges?.filter(edge =>
        edge &&
        edge.source &&
        edge.target
      ) || []

      // 为没有 id 的边生成 id
      const edgesWithIds = validEdges.map(edge => ({
        ...edge,
        id: edge.id || `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))

      // 设置初始数据
      setNodes(validNodes)
      setEdges(edgesWithIds)
      setIsInitialized(true)
    }
  }, [initialNodes, initialEdges, isInitialized, setNodes, setEdges])

  // 连线处理
  const onConnect = useCallback(
    (params: Connection) => {
      // 为新边生成唯一的 ID
      const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newEdge = {
        ...params,
        id: edgeId,
        type: 'default' as const,
        markerEnd: { type: MarkerType.ArrowClosed },
        data: {
          label: '',
          edgeType: 'default',
        },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  // 节点选择处理
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }, [])

  // 边选择处理
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  // 背景点击处理
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [])

  // 添加节点
  const addNode = useCallback((type: string, label: string, x: number, y: number) => {
    const newNode: Node = {
      id: `${type}_${Date.now()}`,
      type,
      position: { x, y },
      data: {
        label,
        nodeType: type,
        nodeKey: type,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [setNodes])

  // 更新节点
  const updateNode = useCallback((nodeId: string, updates: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: updates } : node))
    )
  }, [setNodes])

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    // 删除相关的边
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  // 更新边
  const updateEdge = useCallback((edgeId: string, updates: any) => {
    setEdges((eds) =>
      eds.map((edge) => (edge.id === edgeId ? { ...edge, data: updates } : edge))
    )
  }, [setEdges])

  // 删除边
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId))
    setSelectedEdge(null)
  }, [setEdges])

  // 重置流程
  const resetFlow = useCallback(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setNodes, setEdges, initialNodes, initialEdges])

  // 导出流程
  const exportFlow = useCallback(() => {
    const exportData = {
      nodes: nodes.map((node) => ({
        nodeKey: node.data.nodeKey,
        nodeName: node.data.label,
        nodeType: node.data.nodeType?.toUpperCase(),
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
        config: JSON.stringify({
          assignees: node.data.assignees,
          approveMode: node.data.approveMode,
          condition: node.data.condition,
          timeout: node.data.timeout,
          description: node.data.description,
        }),
      })),
      edges: edges.map((edge) => ({
        sourceNodeKey: edge.source,
        targetNodeKey: edge.target,
        conditionExpr: edge.data?.condition,
        priority: edge.data?.priority,
      })),
    }

    console.log('导出流程数据:', exportData)

    if (onChange) {
      onChange(exportData.nodes as any[], exportData.edges as any[])
    }

    return exportData
  }, [nodes, edges, onChange])

  // 当节点或边变化时，通知父组件
  React.useEffect(() => {
    if (onChange) {
      const exportData = {
        nodes: nodes.map((node) => ({
          id: node.id,
          nodeKey: node.data.nodeKey,
          nodeName: node.data.label,
          nodeType: node.data.nodeType?.toUpperCase(),
          positionX: Math.round(node.position.x),
          positionY: Math.round(node.position.y),
          config: JSON.stringify({
            assignees: node.data.assignees,
            approveMode: node.data.approveMode,
            condition: node.data.condition,
            timeout: node.data.timeout,
            description: node.data.description,
          }),
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceNodeKey: edge.source,
          targetNodeKey: edge.target,
          conditionExpr: edge.data?.condition,
          priority: edge.data?.priority,
        })),
      }
      onChange(exportData.nodes as any[], exportData.edges as any[])
    }
  }, [nodes, edges, onChange])

  return (
    <div className="flex h-full">
      {/* 左侧工具栏 */}
      {!readOnly && (
        <Card className="w-16 mr-4 flex flex-col items-center py-4 gap-2">
          <CardContent className="p-2 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('start', '开始', 100, 100)}
              className="w-12 h-12 flex flex-col items-center justify-center gap-1"
              title="添加开始节点"
            >
              <Box className="w-5 h-5 text-green-500" />
              <span className="text-xs">开始</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('approve', '审批', 250, 100)}
              className="w-12 h-12 flex flex-col items-center justify-center gap-1"
              title="添加审批节点"
            >
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-xs">审批</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('cc', '抄送', 250, 200)}
              className="w-12 h-12 flex flex-col items-center justify-center gap-1"
              title="添加抄送节点"
            >
              <FileText className="w-5 h-5 text-purple-500" />
              <span className="text-xs">抄送</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('condition', '条件', 250, 300)}
              className="w-12 h-12 flex flex-col items-center justify-center gap-1"
              title="添加条件节点"
            >
              <GitBranch className="w-5 h-5 text-orange-500" />
              <span className="text-xs">条件</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('task', '任务', 250, 400)}
              className="w-12 h-12 flex flex-col items-center justify-center gap-1"
              title="添加任务节点"
            >
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-xs">任务</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('end', '结束', 400, 250)}
              className="w-12 h-12 flex flex-col items-center justify-center gap-1"
              title="添加结束节点"
            >
              <Box className="w-5 h-5 text-red-500" />
              <span className="text-xs">结束</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 中间流程画布 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'default',
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          fitView
          attributionPosition="bottom-right"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
          zoomOnScroll
          panOnScroll
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* 右侧属性面板 */}
      <div className="w-80 ml-4">
        <NodePropertiesPanel
          node={selectedNode}
          onUpdate={updateNode}
          onDelete={deleteNode}
          onClose={() => setSelectedNode(null)}
        />
        <EdgePropertiesPanel
          edge={selectedEdge}
          onUpdate={updateEdge}
          onDelete={deleteEdge}
          onClose={() => setSelectedEdge(null)}
        />
      </div>
    </div>
  )
}

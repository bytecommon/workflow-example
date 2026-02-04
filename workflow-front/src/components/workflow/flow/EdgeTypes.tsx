import React, { memo } from 'react'
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react'
import { X } from 'lucide-react'

// 带标签的自定义边
export const CustomEdge = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data, selected }: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#3b82f6' : style.stroke || '#94a3b8',
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

CustomEdge.displayName = 'CustomEdge'

// 条件连线（带条件的边）
export const ConditionalEdge = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data, selected }: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const condition = data?.condition || data?.label || '条件'

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#f97316' : style.stroke || '#fb923c',
        }}
      />
      {condition && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2 - 20}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-orange-50 border border-orange-300 rounded text-xs text-orange-700 shadow-sm"
          >
            {condition}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

ConditionalEdge.displayName = 'ConditionalEdge'

// 边类型映射
export const edgeTypes = {
  default: CustomEdge,
  conditional: ConditionalEdge,
}

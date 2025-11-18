"use client"

import { useCallback, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { ForceGraphMethods } from "react-force-graph-2d"

// Dynamically import to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
})

interface Node {
  id: string
  name: string
  type: "user" | "contact"
  industry?: string
  warmScore?: number
  emailStatus?: "not_sent" | "draft" | "sent" | "opened" | "replied"
  company?: string
  role?: string
  email?: string
  linkedinUrl?: string
  matchReasons?: string[]
  emailDrafts?: any[]
  emailTracking?: any[]
  x?: number
  y?: number
  fixed?: boolean
  size?: number
}

interface Link {
  source: string | Node
  target: string | Node
  strength?: number
}

interface NetworkGraphProps {
  data: {
    nodes: Node[]
    links: Link[]
  }
  onNodeClick?: (node: Node) => void
  colorMode?: "industry" | "warmScore" | "outcome"
}

// Color mappings
const INDUSTRY_COLORS: Record<string, string> = {
  Technology: "#3b82f6", // blue
  Finance: "#10b981", // green
  Consulting: "#8b5cf6", // purple
  Healthcare: "#ef4444", // red
  Marketing: "#f59e0b", // amber
  Engineering: "#06b6d4", // cyan
  Design: "#ec4899", // pink
  Education: "#84cc16", // lime
  "Real Estate": "#f97316", // orange
  Other: "#6b7280", // gray
}

function getNodeColor(
  node: Node,
  colorMode: "industry" | "warmScore" | "outcome"
): string {
  if (node.type === "user") {
    return "#1f2937" // dark gray for user
  }

  switch (colorMode) {
    case "industry":
      return (
        INDUSTRY_COLORS[node.industry || "Other"] || INDUSTRY_COLORS.Other
      )

    case "warmScore":
      // Gradient from red (0) to green (100)
      const score = node.warmScore || 0
      if (score < 30) return "#ef4444" // red
      if (score < 70) return "#f59e0b" // yellow
      return "#10b981" // green

    case "outcome":
      switch (node.emailStatus) {
        case "replied":
          return "#10b981" // green
        case "opened":
          return "#fbbf24" // yellow
        case "sent":
          return "#6b7280" // gray
        case "draft":
          return "#3b82f6" // blue
        default:
          return "#9ca3af" // light gray
      }

    default:
      return "#3b82f6"
  }
}

export default function NetworkGraph({
  data,
  onNodeClick,
  colorMode = "warmScore",
}: NetworkGraphProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)

  const handleNodeClick = useCallback(
    (node: any) => {
      if (onNodeClick) {
        onNodeClick(node as Node)
      }
    },
    [onNodeClick]
  )

  return (
    <div className="w-full h-full relative">
      <ForceGraph2D
        ref={fgRef}
        graphData={data as any}
        nodeLabel={(node: any) => {
          const n = node as Node
          if (n.type === "user") return n.name
          return `${n.name}\n${n.company || ""}\nWarm Score: ${n.warmScore || 0}%`
        }}
        nodeColor={(node: any) => getNodeColor(node as Node, colorMode)}
        nodeVal={(node: any) => (node as Node).size || 10}
        linkColor={() => "rgba(156, 163, 175, 0.3)"}
        linkWidth={(link: any) => ((link as Link).strength || 0.5) * 2}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeHover={(node: any) => setHoveredNode(node ? (node as Node) : null)}
        cooldownTicks={100}
        onEngineStop={() => {
          // Auto-zoom to fit after simulation stops
          setTimeout(() => {
            if (fgRef.current) {
              fgRef.current.zoomToFit(400, 20)
            }
          }, 100)
        }}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          // Draw node label
          const n = node as Node
          const label = n.name
          const fontSize = n.type === "user" ? 14 : 10
          ctx.font = `${fontSize}px Sans-Serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = "#374151"
          const x = n.x || 0
          const y = (n.y || 0) + (n.size || 10) + 5
          ctx.fillText(label, x, y)
        }}
      />
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
          <h3 className="font-semibold text-gray-900">{hoveredNode.name}</h3>
          {hoveredNode.company && (
            <p className="text-sm text-gray-600">{hoveredNode.company}</p>
          )}
          {hoveredNode.role && (
            <p className="text-sm text-gray-500">{hoveredNode.role}</p>
          )}
          {hoveredNode.warmScore !== undefined && (
            <p className="text-sm text-blue-600">
              Warm Score: {hoveredNode.warmScore}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}


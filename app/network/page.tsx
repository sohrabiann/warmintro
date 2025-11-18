"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import NetworkGraph from "@/components/network/NetworkGraph"

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
}

export default function NetworkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [colorMode, setColorMode] = useState<"industry" | "warmScore" | "outcome">("warmScore")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchNetworkData()
    }
  }, [status, router])

  const fetchNetworkData = async () => {
    try {
      const response = await fetch("/api/network/graph")
      if (!response.ok) throw new Error("Failed to fetch network data")
      const data = await response.json()
      setGraphData(data)
    } catch (error) {
      console.error("Error fetching network data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNodeClick = (node: Node) => {
    if (node.type === "contact") {
      setSelectedNode(node)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading network...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Network Map</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Color by:
            </label>
            <select
              value={colorMode}
              onChange={(e) =>
                setColorMode(
                  e.target.value as "industry" | "warmScore" | "outcome"
                )
              }
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="warmScore">Warm Score</option>
              <option value="industry">Industry</option>
              <option value="outcome">Email Outcome</option>
            </select>
            <div className="ml-auto text-sm text-gray-600">
              {graphData?.nodes.filter((n) => n.type === "contact").length || 0}{" "}
              contacts
            </div>
          </div>
        </div>

        {/* Network Graph */}
        <div className="bg-white rounded-lg shadow" style={{ height: "70vh" }}>
          {graphData ? (
            <NetworkGraph
              data={graphData}
              onNodeClick={handleNodeClick}
              colorMode={colorMode}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No network data available</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {colorMode === "warmScore" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Low (0-30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Medium (30-70%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>High (70-100%)</span>
                </div>
              </>
            )}
            {colorMode === "outcome" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Replied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Opened</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span>Sent (no reply)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Draft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span>Not sent</span>
                </div>
              </>
            )}
            {colorMode === "industry" && (
              <span className="text-gray-600">
                Colors represent different industries
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Contact Details Modal */}
      {selectedNode && selectedNode.type === "contact" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedNode.name}
                  </h2>
                  {selectedNode.company && (
                    <p className="text-lg text-gray-600">{selectedNode.company}</p>
                  )}
                  {selectedNode.role && (
                    <p className="text-sm text-gray-500">{selectedNode.role}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedNode.warmScore !== undefined && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Warm Score
                    </h3>
                    <p className="text-blue-600">{selectedNode.warmScore}%</p>
                  </div>
                )}

                {selectedNode.matchReasons && selectedNode.matchReasons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Match Reasons
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {selectedNode.matchReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedNode.email && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-sm text-gray-600">{selectedNode.email}</p>
                  </div>
                )}

                {selectedNode.linkedinUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      LinkedIn
                    </h3>
                    <a
                      href={selectedNode.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Profile
                    </a>
                  </div>
                )}

                {selectedNode.emailDrafts &&
                  selectedNode.emailDrafts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Email History
                      </h3>
                      <div className="space-y-2">
                        {selectedNode.emailDrafts.map((draft: any) => (
                          <div
                            key={draft.id}
                            className="border border-gray-200 rounded p-3"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {draft.subject}
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {draft.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(draft.createdAt).toLocaleDateString()}
                            </p>
                            {selectedNode.emailTracking &&
                              selectedNode.emailTracking[0]?.replied && (
                                <div className="mt-2 p-2 bg-green-50 rounded">
                                  <p className="text-xs text-green-800">
                                    Replied:{" "}
                                    {selectedNode.emailTracking[0].replyContent?.substring(
                                      0,
                                      100
                                    )}
                                    ...
                                  </p>
                                </div>
                              )}
                            <Link
                              href={`/emails/${draft.id}`}
                              className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                            >
                              View Email →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


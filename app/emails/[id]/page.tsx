"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface EmailDraft {
  id: string
  subject: string
  body: string
  status: string
  contact: {
    name: string
    email?: string
    company?: string
    role?: string
  }
}

export default function EmailDraftPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [draft, setDraft] = useState<EmailDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [editedSubject, setEditedSubject] = useState("")
  const [editedBody, setEditedBody] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchDraft()
    }
  }, [params.id])

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/emails/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch draft")
      const data = await response.json()
      setDraft(data.draft)
      setEditedSubject(data.draft.subject)
      setEditedBody(data.draft.body)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/emails/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editedSubject,
          body: editedBody,
          status: "approved",
        }),
      })

      if (!response.ok) throw new Error("Failed to save")
      await fetchDraft()
      alert("Email saved and approved!")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (!confirm("Mark this email as sent? (In MVP, this just updates the status)")) {
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: params.id }),
      })

      if (!response.ok) throw new Error("Failed to send")
      alert("Email marked as sent!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to send. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Email draft not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Draft
            </h1>
            <div className="text-sm text-gray-600">
              To: {draft.contact.name}
              {draft.contact.email && ` <${draft.contact.email}>`}
              {draft.contact.company && ` at ${draft.contact.company}`}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body
              </label>
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm text-gray-900"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || sending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save & Approve"}
              </button>
              <button
                onClick={handleSend}
                disabled={saving || sending || draft.status === "sent"}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : draft.status === "sent" ? "Already Sent" : "Mark as Sent"}
              </button>
            </div>

            {draft.status === "sent" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ This email has been marked as sent
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


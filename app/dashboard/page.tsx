"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Contact {
  id: string
  name: string
  email?: string
  company?: string
  role?: string
  warmScore: number
  matchReasons: string[]
  emailDrafts?: Array<{ id: string; status: string }>
}

interface DashboardStats {
  contactsRecommended: number
  emailsDrafted: number
  emailsSent: number
  emailsOpened: number
  emailsReplied: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    contactsRecommended: 0,
    emailsDrafted: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsReplied: 0,
  })
  const [loading, setLoading] = useState(true)
  const [findingMatches, setFindingMatches] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      // Check if user has completed onboarding
      const userResponse = await fetch("/api/user/check-onboarding")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (!userData.onboardingComplete) {
          router.push("/onboarding")
          return
        }
      }

      // Fetch contacts
      const contactsResponse = await fetch("/api/matches")
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        setContacts(contactsData.matches || [])
      }

      // Fetch stats
      const statsResponse = await fetch("/api/dashboard/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindMatches = async () => {
    setFindingMatches(true)
    try {
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        setContacts(data.matches || [])
        await fetchDashboardData() // Refresh stats
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to find matches. Please try again.")
    } finally {
      setFindingMatches(false)
    }
  }

  const handleGenerateEmail = async (contactId: string) => {
    try {
      const response = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to generate email (${response.status})`)
      }

      const data = await response.json()
      router.push(`/emails/${data.draft.id}`)
    } catch (error: any) {
      console.error("Error:", error)
      alert(`Failed to generate email: ${error.message || "Please check your OpenAI API key and try again."}`)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">WarmIntro</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Contacts Found</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.contactsRecommended}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Emails Drafted</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.emailsDrafted}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Emails Sent</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.emailsSent}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Opened</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.emailsOpened}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Replied</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.emailsReplied}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleFindMatches}
            disabled={findingMatches}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {findingMatches ? "Finding Matches..." : "Find New Matches"}
          </button>
          <Link
            href="/network"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            View Network Map
          </Link>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Warm Matches
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {contacts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 mb-4">
                  No matches yet. Click "Find New Matches" to get started!
                </p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {contact.warmScore}% Match
                        </span>
                      </div>
                      {contact.role && contact.company && (
                        <p className="text-sm text-gray-600 mb-1">
                          {contact.role} at {contact.company}
                        </p>
                      )}
                      {contact.email && (
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      )}
                      {contact.matchReasons.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            {contact.matchReasons.join(" • ")}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {contact.emailDrafts &&
                      contact.emailDrafts.some((d) => d.status === "draft") ? (
                        <Link
                          href={`/emails/${
                            contact.emailDrafts.find((d) => d.status === "draft")
                              ?.id
                          }`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          View Draft
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleGenerateEmail(contact.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Generate Email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


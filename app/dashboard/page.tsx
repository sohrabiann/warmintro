"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import "./dashboard.css"

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
      <div className="loading-state">
        <div className="loading-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-glow"></div>

      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <div className="dashboard-logo-mark">W</div>
            <div className="dashboard-logo-text">WarmIntro</div>
          </div>
          <div className="dashboard-user-info">
            <Link href="/onboarding" className="text-sm text-gray-400 hover:text-white transition-colors mr-4">
              Edit Profile
            </Link>
            <span className="dashboard-user-name">
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="dashboard-sign-out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Contacts Found</div>
            <div className="stat-value">
              {stats.contactsRecommended}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Emails Drafted</div>
            <div className="stat-value">
              {stats.emailsDrafted}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Emails Sent</div>
            <div className="stat-value">
              {stats.emailsSent}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Opened</div>
            <div className="stat-value">
              {stats.emailsOpened}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Replied</div>
            <div className="stat-value">
              {stats.emailsReplied}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="dashboard-actions">
          <button
            onClick={handleFindMatches}
            disabled={findingMatches}
            className="btn-gradient"
          >
            {findingMatches ? "Finding Matches..." : "Find New Matches"}
          </button>
          <Link
            href="/network"
            className="btn-secondary"
          >
            View Network Map
          </Link>
        </div>

        {/* Contacts List */}
        <div className="contacts-section">
          <div className="contacts-header">
            <h2 className="contacts-title">
              Your Warm Matches
            </h2>
          </div>
          <div>
            {contacts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">
                  No matches yet. Click "Find New Matches" to get started!
                </p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-info">
                    <div className="contact-details">
                      <div className="contact-header">
                        <h3 className="contact-name">
                          {contact.name}
                        </h3>
                        <span className="match-badge">
                          {contact.warmScore}% Match
                        </span>
                      </div>
                      {contact.role && contact.company && (
                        <p className="contact-role">
                          {contact.role} at {contact.company}
                        </p>
                      )}
                      {contact.email && (
                        <p className="contact-email">{contact.email}</p>
                      )}
                      {contact.matchReasons.length > 0 && (
                        <div className="contact-reasons">
                          {contact.matchReasons.join(" • ")}
                        </div>
                      )}
                    </div>
                    <div className="contact-actions">
                      {contact.emailDrafts &&
                        contact.emailDrafts.some((d) => d.status === "draft") ? (
                        <Link
                          href={`/emails/${contact.emailDrafts.find((d) => d.status === "draft")
                            ?.id
                            }`}
                          className="btn-small btn-view"
                        >
                          View Draft
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleGenerateEmail(contact.id)}
                          className="btn-small btn-generate"
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

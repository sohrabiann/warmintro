"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import { INDUSTRIES, INDUSTRIES_DATA } from "@/lib/data/industries"
import "./onboarding.css"

const COMMON_INTERESTS = [
  "Basketball",
  "Tennis",
  "Gym/Fitness",
  "Crypto",
  "Design",
  "Robotics",
  "Photography",
  "Music",
  "Travel",
  "Reading",
  "Gaming",
  "Cooking",
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    targetIndustry: "",
    targetJobRole: "",
    interests: [] as string[],
    university: "",
    graduationYear: new Date().getFullYear(),
  })

  const [availableRoles, setAvailableRoles] = useState<string[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/onboarding")
        if (response.ok) {
          const data = await response.json()
          // Only set data if it exists (user has completed onboarding before)
          if (data.targetIndustry) {
            setFormData({
              targetIndustry: data.targetIndustry || "",
              targetJobRole: data.targetJobRole || "",
              interests: data.interests || [],
              university: data.university || "",
              graduationYear: data.graduationYear || new Date().getFullYear(),
            })
            setIsEditing(true)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    if (session?.user) {
      fetchUserData()
    } else {
      setInitialLoading(false)
    }
  }, [session])

  // Update available roles when industry changes
  useEffect(() => {
    if (formData.targetIndustry && INDUSTRIES_DATA[formData.targetIndustry]) {
      setAvailableRoles(INDUSTRIES_DATA[formData.targetIndustry])
    } else {
      setAvailableRoles([])
    }
  }, [formData.targetIndustry])

  const handleIndustryChange = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      targetIndustry: industry,
      targetJobRole: "", // Reset job role when industry changes
    }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save onboarding data")

      // Use replace instead of push to avoid back button issues
      router.replace("/dashboard")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to save. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-glow"></div>
        <div className="onboarding-loading">
          <div className="onboarding-loading-text">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-glow"></div>
      
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-header">
            <h1 className="onboarding-title">
              {isEditing ? "Update your profile" : "Welcome to WarmIntro!"}
            </h1>
            <p className="onboarding-subtitle">
              {isEditing
                ? "Update your details to find better connections"
                : "Let's set up your profile to find the best connections"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="onboarding-form">
            {/* Target Industry */}
            <div className="onboarding-field">
              <label className="onboarding-label">
                Target Industry *
              </label>
              <SearchableSelect
                options={INDUSTRIES}
                value={formData.targetIndustry}
                onChange={handleIndustryChange}
                placeholder="Select or search industry..."
              />
            </div>

            {/* Target Job Role */}
            <div className="onboarding-field">
              <label className="onboarding-label">
                Target Job Role *
              </label>
              <SearchableSelect
                options={availableRoles}
                value={formData.targetJobRole}
                onChange={(role) => setFormData({ ...formData, targetJobRole: role })}
                placeholder={
                  formData.targetIndustry
                    ? "Select or search job role..."
                    : "Select an industry first"
                }
                disabled={!formData.targetIndustry}
              />
            </div>

            {/* University */}
            <div className="onboarding-field">
              <label className="onboarding-label">
                University *
              </label>
              <input
                type="text"
                required
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                placeholder="e.g., University of Western Ontario"
                className="onboarding-input"
              />
            </div>

            {/* Graduation Year */}
            <div className="onboarding-field">
              <label className="onboarding-label">
                Graduation Year *
              </label>
              <input
                type="number"
                required
                min="2000"
                max="2030"
                value={formData.graduationYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    graduationYear: parseInt(e.target.value),
                  })
                }
                className="onboarding-input"
              />
            </div>

            {/* Interests */}
            <div className="onboarding-field">
              <label className="onboarding-label">
                Interests (select all that apply)
              </label>
              <div className="onboarding-interests-grid">
                {COMMON_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`onboarding-interest-btn ${formData.interests.includes(interest)
                        ? "onboarding-interest-btn-active"
                        : "onboarding-interest-btn-inactive"
                      }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.targetIndustry || !formData.targetJobRole}
              className="onboarding-submit-btn"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

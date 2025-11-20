"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import { INDUSTRIES, INDUSTRIES_DATA } from "@/lib/data/industries"

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

      router.push("/dashboard")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to save. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? "Update your profile" : "Welcome to WarmIntro!"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update your details to find better connections"
                : "Let's set up your profile to find the best connections"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests (select all that apply)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COMMON_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${formData.interests.includes(interest)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

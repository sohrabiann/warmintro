"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Consulting",
  "Healthcare",
  "Marketing",
  "Engineering",
  "Design",
  "Education",
  "Real Estate",
  "Other",
]

const SENIORITY_LEVELS = [
  { value: "junior", label: "Junior (0-3 years)" },
  { value: "mid", label: "Mid-level (3-7 years)" },
  { value: "senior", label: "Senior (7+ years)" },
]

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
  const [formData, setFormData] = useState({
    targetIndustry: "",
    targetSeniority: "",
    interests: [] as string[],
    university: "",
    graduationYear: new Date().getFullYear(),
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to WarmIntro!
            </h1>
            <p className="text-gray-600">
              Let's set up your profile to find the best connections
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Industry *
              </label>
              <select
                required
                value={formData.targetIndustry}
                onChange={(e) =>
                  setFormData({ ...formData, targetIndustry: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select an industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Seniority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Seniority Level *
              </label>
              <div className="space-y-2">
                {SENIORITY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="seniority"
                      value={level.value}
                      checked={formData.targetSeniority === level.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetSeniority: e.target.value,
                        })
                      }
                      className="mr-3"
                      required
                    />
                    <span>{level.label}</span>
                  </label>
                ))}
              </div>
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
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.interests.includes(interest)
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
              disabled={loading}
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


import { User, Contact } from "@prisma/client"

interface MatchCandidate {
  name: string
  email?: string
  linkedinUrl?: string
  company?: string
  role?: string
  location?: string
  university?: string
  graduationYear?: number
  interests: string[]
}

interface MatchResult {
  candidate: MatchCandidate
  score: number
  reasons: string[]
}

// Mock contact data for MVP
const MOCK_CONTACTS: MatchCandidate[] = [
  {
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    linkedinUrl: "https://linkedin.com/in/sarahchen",
    company: "TechCorp",
    role: "Senior Software Engineer",
    location: "Toronto, ON",
    university: "University of Western Ontario",
    graduationYear: 2018,
    interests: ["Basketball", "Gym/Fitness", "Design"],
  },
  {
    name: "Michael Park",
    email: "m.park@finance.com",
    linkedinUrl: "https://linkedin.com/in/michaelpark",
    company: "Finance Inc",
    role: "Investment Analyst",
    location: "Toronto, ON",
    university: "University of Western Ontario",
    graduationYear: 2020,
    interests: ["Tennis", "Crypto", "Reading"],
  },
  {
    name: "Emily Rodriguez",
    email: "emily.r@consulting.com",
    linkedinUrl: "https://linkedin.com/in/emilyrodriguez",
    company: "Consulting Group",
    role: "Management Consultant",
    location: "Vancouver, BC",
    university: "University of Toronto",
    graduationYear: 2019,
    interests: ["Photography", "Travel", "Design"],
  },
  {
    name: "James Wilson",
    email: "j.wilson@techstartup.com",
    linkedinUrl: "https://linkedin.com/in/jameswilson",
    company: "TechStartup",
    role: "Product Manager",
    location: "Toronto, ON",
    university: "University of Western Ontario",
    graduationYear: 2017,
    interests: ["Basketball", "Gaming", "Crypto"],
  },
  {
    name: "Lisa Thompson",
    email: "lisa.t@healthcare.com",
    linkedinUrl: "https://linkedin.com/in/lisathompson",
    company: "Healthcare Systems",
    role: "Healthcare Consultant",
    location: "Montreal, QC",
    university: "McGill University",
    graduationYear: 2021,
    interests: ["Gym/Fitness", "Reading", "Cooking"],
  },
]

export function calculateWarmScore(
  user: User,
  candidate: MatchCandidate
): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Same university (high weight: 40 points)
  if (
    user.university &&
    candidate.university &&
    user.university.toLowerCase() === candidate.university.toLowerCase()
  ) {
    score += 40
    reasons.push(`Both ${user.university} alumni`)
  }

  // Similar graduation year (medium weight: 15 points)
  if (user.graduationYear && candidate.graduationYear) {
    const yearDiff = Math.abs(user.graduationYear - candidate.graduationYear)
    if (yearDiff <= 2) {
      score += 15
      reasons.push(`Similar graduation year (${yearDiff} year${yearDiff > 1 ? "s" : ""} apart)`)
    } else if (yearDiff <= 5) {
      score += 5
    }
  }

  // Shared interests (medium weight: 10 points per interest, max 30)
  const sharedInterests = user.interests.filter((interest) =>
    candidate.interests.includes(interest)
  )
  if (sharedInterests.length > 0) {
    const interestPoints = Math.min(sharedInterests.length * 10, 30)
    score += interestPoints
    reasons.push(
      `Shared interests: ${sharedInterests.slice(0, 2).join(", ")}${
        sharedInterests.length > 2 ? "..." : ""
      }`
    )
  }

  // Same location (low weight: 10 points)
  if (user.location && candidate.location) {
    const userCity = user.location.split(",")[0].toLowerCase()
    const candidateCity = candidate.location.split(",")[0].toLowerCase()
    if (userCity === candidateCity) {
      score += 10
      reasons.push(`Same city: ${candidate.location}`)
    }
  }

  // Target industry match (medium weight: 15 points)
  if (user.targetIndustry && candidate.company) {
    // Simple check - in real implementation, would check company industry
    score += 5 // Base points for having company info
  }

  return {
    candidate,
    score: Math.min(score, 100), // Cap at 100
    reasons,
  }
}

export function findTopMatches(user: User, limit: number = 3): MatchResult[] {
  const matches = MOCK_CONTACTS.map((candidate) =>
    calculateWarmScore(user, candidate)
  )

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)

  // Return top matches
  return matches.slice(0, limit)
}


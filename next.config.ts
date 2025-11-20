import type { NextConfig } from "next"

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://platform.linkedin.com https://static.licdn.com",
      "connect-src 'self' https://*.linkedin.com https://*.licdn.com https://api.openai.com https://supabase.co https://*.supabase.co",
      "img-src 'self' data: https://*.linkedin.com https://*.licdn.com https://images.unsplash.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-src 'self' https://www.linkedin.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

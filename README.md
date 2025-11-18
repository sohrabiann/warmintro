# WarmIntro MVP

AI-Powered Warm Networking Platform for Young Professionals

## Features

- **LinkedIn OAuth Authentication** - Sign in with your LinkedIn account
- **Smart Matching** - Find professionals with shared connections, interests, and backgrounds
- **AI Email Generation** - Get personalized introduction emails powered by OpenAI
- **Dashboard Analytics** - Track your networking efforts and progress
- **Contact Management** - View and manage your warm matches
- **Network Visualization** - Interactive node graph showing your networking connections

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js v5** - Authentication
- **OpenAI API** - Email generation
- **Tailwind CSS** - Styling
- **react-force-graph-2d** - Network visualization

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/warmintro?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   LINKEDIN_CLIENT_ID="your-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Project Structure

```
warmintro/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── emails/           # Email draft pages
│   ├── network/          # Network visualization page
│   ├── onboarding/       # Onboarding flow
│   └── page.tsx          # Landing page
├── components/           # React components
│   └── network/         # Network graph component
├── lib/                  # Utility functions
├── prisma/              # Database schema
└── public/              # Static assets
```

## MVP Limitations

- No actual email sending (just marks as sent)
- Mock contact data (no LinkedIn API scraping)
- Basic matching algorithm
- Network visualization with interactive graph

## Next Steps

- Integrate real LinkedIn API for contact discovery
- Add actual email sending via Gmail/Outlook API
- Network visualization implemented ✓
- Add follow-up automation
- Enhance matching algorithm with vector search

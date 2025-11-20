import Link from "next/link"
import "./landing.css"

export default function Home() {
  return (
      <div className="page">
        <div className="glow"></div>

        <header>
          <div className="logo">
            <div className="logo-mark">W</div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>WarmIntro</div>
          </div>
          <nav>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#metrics">For students</a>
          </nav>
          <div className="header-actions">
            <Link href="/auth/signin" className="btn btn-outline">Log in</Link>
            <Link href="/auth/signin" className="btn btn-primary">Get early access</Link>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="fade-up">
              <div className="hero-pill">
                <div className="dot"></div>
                AI-powered warm networking for students
              </div>
              <h1 className="hero-title">
                Turn <span className="gradient-text">shared stories</span> into
                <span className="gradient-text"> real intros</span>.
          </h1>
              <p className="hero-sub">
                WarmIntro reads your LinkedIn, finds alumni, shared sports, clubs and interests,
                then drafts personal outreach that actually gets replies. No more copy-paste cold emails.
              </p>
              <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link href="/auth/signin" className="btn btn-primary">Join the waitlist</Link>
                <button className="btn btn-outline">Watch 60s demo →</button>
              </div>
              <p className="hero-meta">
                Built for students and young professionals • Works with LinkedIn + Gmail • No scraping, no spam blasts.
              </p>
            </div>

            <div className="fade-up delay-1">
              <div className="hero-card">
                <div className="hero-card-header">Sample warm intro</div>
                <div className="hero-profile">
                  <div className="hero-avatar">AS</div>
                  <div className="hero-profile-text">
                    <strong>Aaron • Western MechEng ’25</strong>
                    <span>Target: Product Engineer @ Automotive Startup</span>
                  </div>
                </div>
                <div className="hero-message">
                  "Hey Jamie — I noticed we're both Western MechEng grads and you also played varsity
                  soccer. I've been working on AI-driven maintenance at an automotive supplier and would
                  love to ask you 2–3 questions about your path into product engineering. Would you be
                  open to a quick 15-minute call?"
                </div>
                <div className="hero-metrics">
                  <div className="metric-pill">
                    <span className="metric-label">Reply rate</span>
                    <span className="metric-value">61%</span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-label">Intros this month</span>
                    <span className="metric-value">14</span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-label">Calls booked</span>
                    <span className="metric-value">6</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how" className="section fade-up delay-1">
            <h2>
              From profile to <span className="gradient-text">warm conversation</span> in three steps.
            </h2>
            <p className="section-sub">
              WarmIntro acts like a networking co-pilot: it understands your background, surfaces
              high-overlap professionals, and gives you a thoughtful first draft so you can focus on the conversation.
            </p>

            <div className="grid-3">
              <div className="card">
                <div className="step-index">1</div>
                <h3>Connect your LinkedIn</h3>
                <p>
                  We read your education, clubs, sports, work history and skills. You can add the details your profile doesn't capture: interests, goals, side projects and more.
                </p>
              </div>
              <div className="card">
                <div className="step-index">2</div>
                <h3>We find your top matches</h3>
                <p>
                  Each week, WarmIntro scans thousands of profiles to find alumni and professionals with multiple overlaps: same school, teams, clubs, interests or mutual connections.
                </p>
              </div>
              <div className="card">
                <div className="step-index">3</div>
                <h3>You approve personal intros</h3>
                <p>
                  For each match, we draft a high-context message. You review, tweak if you want, and send it directly from your own inbox so it feels completely human.
                </p>
              </div>
            </div>
          </section>

          <section id="features" className="section fade-up delay-2">
            <h2>
              Everything you need to <span className="gradient-text">break into an industry</span>.
            </h2>
            <p className="section-sub">
              Instead of guessing who to message and what to say, WarmIntro gives you curated targets, thoughtful intros, and a clean view of what's actually working.
            </p>

            <div className="grid-3">
              <div className="card">
                <h3>Smart matching</h3>
                <p>
                  Match on alumni, majors, sports, clubs, interests and mutuals. We prioritize depth of overlap so each outreach feels natural, not random.
                </p>
              </div>
              <div className="card">
                <h3>Inbox-native</h3>
                <p>
                  Send from Gmail or Outlook so recipients see your real name and address. No bulk tools, no tracking links that scream "campaign".
                </p>
              </div>
              <div className="card">
                <h3>Live analytics</h3>
                <p>
                  Track opens, replies, intros and calls in one view. Learn which types of stories and angles get the best responses over time.
                </p>
              </div>
              <div className="card">
                <h3>Network visualizer</h3>
                <p>
                  Watch your network map grow as you connect with new people across companies and cities, and see which conversations lead to real opportunities.
                </p>
              </div>
              <div className="card">
                <h3>Student-friendly</h3>
                <p>
                  Designed to fit around classes and work. A few curated intros per week, not another full-time job managing outreach.
                </p>
              </div>
              <div className="card">
                <h3>Respectful by design</h3>
                <p>
                  No scraping, list selling or spam blasts. Every intro is context-rich, opt-in and easy for the other person to say yes to.
                </p>
              </div>
            </div>
          </section>

          <section id="metrics" className="section fade-up delay-3">
            <div className="metrics-layout">
              <div>
                <h2>
                  Give your future self a <span className="gradient-text">stronger network</span> to stand on.
                </h2>
                <p className="section-sub">
                  Early testers consistently reported more replies and higher-quality conversations with professionals in their target fields after just a few weeks of using WarmIntro.
          </p>
        </div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="label">Avg. reply lift</div>
                  <div className="value">2.4×</div>
                  <div className="hint">Compared to unstructured cold outreach.</div>
                </div>
                <div className="metric-card">
                  <div className="label">Calls booked</div>
                  <div className="value">+6 / month</div>
                  <div className="hint">For active student users in pilot programs.</div>
                </div>
                <div className="metric-card">
                  <div className="label">Time spent</div>
                  <div className="value">15 min</div>
                  <div className="hint">Typical weekly commitment to review and send intros.</div>
                </div>
                <div className="metric-card">
                  <div className="label">Would recommend</div>
                  <div className="value">92%</div>
                  <div className="hint">Students who would share WarmIntro with a friend.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="cta fade-up delay-4">
            <h3>
              Join the first <span className="gradient-text">WarmIntro cohort</span>.
            </h3>
            <p>
              We're inviting a small group of students and young professionals to help shape the product.
              If you care about relationships more than spam, this is for you.
            </p>
            <div className="cta-actions">
              <Link href="/auth/signin" className="btn btn-primary">Apply for early access</Link>
              <button className="btn btn-outline">Bring WarmIntro to my campus →</button>
        </div>
          </section>
      </main>

        <footer>
          © 2025 WarmIntro. Built for people who hate spam but love real conversations.
        </footer>
      </div>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import "./landing.css"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="page">
      <div className="glow"></div>

      <header>
        <div className="logo">
          <div className="logo-mark">W</div>
          <div style={{ fontWeight: 600, fontSize: "15px" }}>WarmIntro</div>
        </div>
        <nav className={`nav-desktop ${mobileMenuOpen ? "nav-mobile-open" : ""}`}>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#metrics" onClick={() => setMobileMenuOpen(false)}>For students</a>
        </nav>
        <div className="header-actions">
          <Link href="/auth/signin" className="btn btn-outline btn-login">Log in</Link>
          <Link href="/auth/signin" className="btn btn-primary">Get early access</Link>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
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
              AI finds alumni with shared backgrounds and drafts personalized intros that get replies.
            </p>
            <div className="hero-actions">
              <Link href="/auth/signin" className="btn btn-primary">Try now!</Link>
              <button className="btn btn-outline">See how it works →</button>
            </div>

          </div>

          <div className="fade-up delay-1">
            <div className="hero-card">
              <div className="hero-card-header">Sample warm intro</div>
              <div className="hero-profile">
                <div className="hero-avatar">AS</div>
                <div className="hero-profile-text">
                  <strong>Aaron • Western MechEng '25</strong>
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
            Your AI networking co-pilot that finds the right people and writes the perfect intro.
          </p>

          <div className="grid-3">
            <div className="card">
              <div className="step-index">1</div>
              <h3>Connect your LinkedIn</h3>
              <p>
                We analyze your LinkedIn profile and resume to understand your education, sports, clubs, and work history.
              </p>
            </div>
            <div className="card">
              <div className="step-index">2</div>
              <h3>We find your top matches</h3>
              <p>
                Tell us what industries you want to break into, and we'll find alumni and professionals who can help.
              </p>
            </div>
            <div className="card">
              <div className="step-index">3</div>
              <h3>Send your WarmIntro</h3>
              <p>
                Review your personalized intro, make any tweaks, and send it directly from your inbox.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="section fade-up delay-2">
          <h2>
            Everything you need to <span className="gradient-text">break into an industry</span>.
          </h2>
          <p className="section-sub">
            Everything you need to build real professional relationships.
          </p>

          <div className="grid-3">
            <div className="card">
              <h3>Smart matching</h3>
              <p>
                Find alumni with shared schools, sports, clubs, and interests. Every match feels natural.
              </p>
            </div>
            <div className="card">
              <h3>Inbox-native</h3>
              <p>
                Send from your Gmail or Outlook. No spam tools, no tracking links.
              </p>
            </div>
            <div className="card">
              <h3>Live analytics</h3>
              <p>
                Track replies, calls, and what's working in real-time.
              </p>
            </div>
            <div className="card">
              <h3>Student-friendly</h3>
              <p>
                A few curated intros per week. Not another full-time job.
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
                Students using WarmIntro see 2.4× more replies and book 6+ calls per month.
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
            Join students building real relationships, not sending spam.
          </p>
          <div className="cta-actions">
            <Link href="/auth/signin" className="btn btn-primary">Try now!</Link>
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

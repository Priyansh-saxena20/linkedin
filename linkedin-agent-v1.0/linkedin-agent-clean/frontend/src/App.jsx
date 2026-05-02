import { useState } from 'react'
import StatusBar from './components/StatusBar'
import Sidebar from './components/Sidebar'
import ContentPage from './pages/ContentPage'
import BrandPage from './pages/BrandPage'
import JobPage from './pages/JobPage'

function Dashboard({ onSelect }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--accent)', letterSpacing: 2, marginBottom: 12
        }}>
          $ ./agent --start
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800,
          color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.1,
          marginBottom: 16
        }}>
          Your LinkedIn<br />
          <span style={{ color: 'var(--accent)' }}>AI Agent</span>
          <span className="cursor" style={{ fontFamily: 'var(--font-mono)', fontSize: 32 }}></span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480 }}>
          Priyansh Saxena · DevOps & Platform Engineer · Deutsche Telekom Digital Labs
        </p>
      </div>

      {/* Mode cards */}
      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 40 }}>
        {[
          {
            id: 'content', icon: '✦', label: 'Content Mode',
            desc: 'Narrate your daily work → viral LinkedIn post with story structure',
            color: 'var(--green)', dim: 'var(--green-dim)',
            examples: ['MongoDB migration story', 'K8s upgrade post', 'Istio mesh deep-dive']
          },
          {
            id: 'brand', icon: '◈', label: 'Brand Mode',
            desc: 'Events, hackathons & achievements → thought-leadership content',
            color: 'var(--purple)', dim: 'var(--purple-dim)',
            examples: ['DT Cost Smash event', 'FIFA 2026 infra', 'Hackathon win']
          },
          {
            id: 'job', icon: '⊕', label: 'Job Hunt',
            desc: 'Paste any JD → cover letter, keywords & recruiter DM generated',
            color: 'var(--amber)', dim: 'var(--amber-dim)',
            examples: ['Cloudflare Platform Eng', 'Datadog SRE role', 'HashiCorp DevOps']
          }
        ].map(m => (
          <button key={m.id} onClick={() => onSelect(m.id)} style={{
            textAlign: 'left', padding: '20px', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            cursor: 'pointer', transition: 'all 0.2s ease',
            fontFamily: 'var(--font-mono)'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.border = `1px solid ${m.color}50`
              e.currentTarget.style.background = m.dim
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = '1px solid var(--border)'
              e.currentTarget.style.background = 'var(--bg-card)'
            }}
          >
            <div style={{ fontSize: 24, color: m.color, marginBottom: 12 }}>{m.icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 8
            }}>{m.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
              {m.desc}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {m.examples.map(ex => (
                <div key={ex} style={{ fontSize: 10, color: 'var(--text-muted)' }}>→ {ex}</div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="fade-up fade-up-2" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10
      }}>
        {[
          ['2+', 'years experience'],
          ['42', 'apps migrated at Care'],
          ['3TB', 'MongoDB migrated'],
          ['FIFA', '2026 infra prep'],
        ].map(([num, label]) => (
          <div key={label} style={{
            padding: '14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
              color: 'var(--accent)', marginBottom: 4
            }}>{num}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('home')

  const renderPage = () => {
    switch (page) {
      case 'content': return <ContentPage />
      case 'brand': return <BrandPage />
      case 'job': return <JobPage />
      default: return <Dashboard onSelect={setPage} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <StatusBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={page} onSelect={setPage} />
        <main style={{
          flex: 1, overflow: 'auto', padding: '36px 40px',
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(37,99,235,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(5,150,105,0.05) 0%, transparent 55%),
            var(--bg)
          `
        }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

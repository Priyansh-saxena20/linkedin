import { useState, useEffect } from 'react'
import { checkStatus } from '../hooks/useApi'

export default function StatusBar() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const s = await checkStatus()
        setStatus(s)
        setError(false)
      } catch {
        setError(true)
      }
    }
    fetch_()
    const id = setInterval(fetch_, 15000)
    return () => clearInterval(id)
  }, [])

  const startLinkedInOAuth = () => {
    window.location.href = '/api/linkedin/start'
  }

  const dot = (on, label, colorOn, colorOff) => (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
      color: on ? colorOn : colorOff,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: on ? colorOn : colorOff,
        animation: on ? 'pulse-dot 2s ease infinite' : 'none',
      }} />
      {label}
    </span>
  )

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)', fontSize: 11,
      fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)'
    }}>
      <span style={{ color: 'var(--text-muted)' }}>priyansh@agent:~$</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {error
          ? dot(false, 'backend offline', 'var(--red)', 'var(--text-muted)')
          : status ? (
            <>
              {dot(
                Boolean(status.ai_provider),
                status.ai_provider === 'anthropic'
                  ? 'claude'
                  : status.ai_provider === 'gemini'
                    ? 'gemini'
                    : 'ai',
                'var(--green)',
                'var(--text-muted)',
              )}
              {dot(
                status.linkedin_connected,
                'linkedin',
                'var(--green)',
                'var(--red)',
              )}
              <span style={{ color: 'var(--text-muted)' }}>
                model: {status.ai_model || '—'}
              </span>
              {!status.linkedin_connected && status.linkedin_oauth_ready === false && (
                <span style={{ color: 'var(--amber)', fontSize: 10 }}>
                  LinkedIn: set CLIENT_ID + SECRET in .env
                </span>
              )}
              {!status.linkedin_connected && status.linkedin_oauth_ready !== false && (
                <button
                  type="button"
                  onClick={startLinkedInOAuth}
                  style={{
                    marginLeft: 8,
                    padding: '4px 10px',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    border: '1px solid var(--accent)',
                    borderRadius: 4,
                    background: 'var(--bg-elevated)',
                    color: 'var(--accent)',
                  }}
                >
                  Connect LinkedIn
                </button>
              )}
            </>
          ) : dot(false, 'connecting...', 'var(--amber)', 'var(--text-muted)')}
      </div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { generate } from '../hooks/useApi'
import OutputPanel from '../components/OutputPanel'
import VoiceDictationButton from '../components/VoiceDictationButton'

const TARGET_COMPANIES = [
  'Hotstar', 'JP Morgan', 'Zscaler', 'Cloudflare', 'HashiCorp',
  'Datadog', 'Grafana Labs', 'MongoDB Inc', 'Red Hat', 'Razorpay',
  'CRED', 'PhonePe', 'Palo Alto', 'Apple', 'Atlassian'
]

export default function JobPage() {
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const appendVoice = useCallback((text) => {
    const t = (text || '').trim()
    if (!t) return
    setJd((prev) => {
      if (!prev) return t
      const sep = /\s$/.test(prev) ? '' : ' '
      return prev + sep + t
    })
  }, [])

  const submit = async () => {
    if (!jd.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await generate('job', jd)
      setResult(data.result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 22, color: 'var(--amber)' }}>⊕</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px'
          }}>Job Hunter</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 34 }}>
          Paste any JD → get a tailored cover letter, keywords & recruiter DM
        </p>
      </div>

      {/* Target companies */}
      <div className="fade-up fade-up-1" style={{
        padding: '14px 16px', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', background: 'var(--bg-card)',
        marginBottom: 16
      }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>
          TARGET COMPANIES (product-based only)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TARGET_COMPANIES.map(c => (
            <span key={c} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              border: '1px solid var(--border-bright)', background: 'var(--amber-dim)',
              color: 'var(--amber)', fontFamily: 'var(--font-mono)'
            }}>{c}</span>
          ))}
        </div>
      </div>

      {/* JD input */}
      <div className="fade-up fade-up-2" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: 1 }}>JOB DESCRIPTION</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>paste from linkedin / naukri / company site</span>
        </div>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder={`Paste the full job description here...

Example:
Senior DevOps Engineer - Cloudflare
We're looking for a DevOps Engineer to join our Platform team...
- 3+ years experience with Kubernetes
- Strong knowledge of CI/CD pipelines
- Experience with cloud providers (AWS/GCP/Azure)
...`}
          rows={12}
          style={{
            width: '100%', padding: '16px', background: 'var(--bg-input)',
            border: 'none', outline: 'none', resize: 'vertical',
            color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.7,
            fontFamily: 'var(--font-mono)'
          }}
        />
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12,
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <VoiceDictationButton onAppend={appendVoice} disabled={loading} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{jd.length} chars</span>
          </div>
          <button onClick={submit} disabled={loading || !jd.trim()} style={{
            padding: '9px 24px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--amber)',
            background: loading ? 'transparent' : 'var(--amber-dim)',
            color: 'var(--amber)', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {loading && <span style={{ width: 10, height: 10, border: '1.5px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />}
            {loading ? 'analyzing jd...' : '⊕ analyze & generate'}
          </button>
        </div>
      </div>

      {/* What you'll get */}
      {!result && !loading && (
        <div className="fade-up fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            ['Cover Letter', 'Technical + culture fit + confident close', 'var(--accent)'],
            ['8 Keywords', 'Resume keywords from the JD to add', 'var(--green)'],
            ['Recruiter DM', 'Max 5 sentence outreach message', 'var(--purple)'],
          ].map(([title, desc, color]) => (
            <div key={title} style={{
              padding: '12px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-card)'
            }}>
              <div style={{ fontSize: 12, color, marginBottom: 4, fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--red)', background: 'var(--red-dim)', color: 'var(--red)', fontSize: 12, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {result && <OutputPanel result={result} mode="job" onResultChange={setResult} />}
    </div>
  )
}

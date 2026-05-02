import { useState, useCallback } from 'react'
import { generate } from '../hooks/useApi'
import OutputPanel from '../components/OutputPanel'
import VoiceDictationButton from '../components/VoiceDictationButton'

const PLACEHOLDER = `I participated in Deutsche Telekom's internal Cost Smash challenge where I presented ideas on how to save infrastructure costs in our account. 

I also participated in DT's internal hackathon this month. We built a solution for automated cost monitoring using Kubernetes metrics and VictoriaMetrics.`

export default function BrandPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const appendVoice = useCallback((text) => {
    const t = (text || '').trim()
    if (!t) return
    setInput((prev) => {
      if (!prev) return t
      const sep = /\s$/.test(prev) ? '' : ' '
      return prev + sep + t
    })
  }, [])

  const submit = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await generate('brand', input)
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
          <span style={{ fontSize: 22, color: 'var(--purple)' }}>◈</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px'
          }}>Brand Strategist</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 34 }}>
          Events, hackathons & achievements → compelling thought-leadership content
        </p>
      </div>

      {/* Event type chips */}
      <div className="fade-up fade-up-1" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Hackathon', 'Cost-saving event', 'Tech talk', 'Certification', 'Open source', 'Conference'].map(tag => (
          <button key={tag} onClick={() => setInput(prev => prev ? prev + `\n\n[${tag}] ` : `[${tag}] `)} style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 20,
            border: '1px solid var(--border-bright)', background: 'var(--purple-dim)',
            color: 'var(--purple)', cursor: 'pointer', fontFamily: 'var(--font-mono)'
          }}>+ {tag}</button>
        ))}
      </div>

      <div className="fade-up fade-up-2" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 10, color: 'var(--purple)', letterSpacing: 1 }}>INPUT</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>describe the event or achievement</span>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={8}
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
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{input.length} chars</span>
          </div>
          <button onClick={submit} disabled={loading || !input.trim()} style={{
            padding: '9px 24px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--purple)',
            background: loading ? 'transparent' : 'var(--purple-dim)',
            color: 'var(--purple)', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {loading && <span style={{ width: 10, height: 10, border: '1.5px solid var(--purple)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />}
            {loading ? 'crafting story...' : '◈ craft brand post'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--red)', background: 'var(--red-dim)', color: 'var(--red)', fontSize: 12, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}

      {result && <OutputPanel result={result} mode="brand" />}
    </div>
  )
}

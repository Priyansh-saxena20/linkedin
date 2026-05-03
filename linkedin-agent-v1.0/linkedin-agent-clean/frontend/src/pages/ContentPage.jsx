import { useState, useCallback } from 'react'
import { generate } from '../hooks/useApi'
import OutputPanel from '../components/OutputPanel'
import VoiceDictationButton from '../components/VoiceDictationButton'

const PLACEHOLDER = `Today I led a MongoDB migration at Deutsche Telekom. We moved a 3TB cluster from OneApp to OneMind account and upgraded to version 8.0.20.

Strategy: First stopped the binder services to block write operations. Then did a full dump & restore which took around 3-4 hours. After that resumed all binders and did sanity checks. Zero downtime achieved.`

export default function ContentPage() {
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
      const data = await generate('content', input)
      setResult(data.result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 22, color: 'var(--green)' }}>✦</span>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px'
          }}>Content Generator</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 34 }}>
          Narrate your work in plain words → agent crafts a viral LinkedIn post
        </p>
      </div>

      {/* Input */}
      <div className="fade-up fade-up-1" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)'
        }}>
          <span style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1 }}>INPUT</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>tell me what you did today</span>
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
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {input.length} chars
            </span>
          </div>
          <button onClick={submit} disabled={loading || !input.trim()} style={{
            padding: '9px 24px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--green)',
            background: loading ? 'transparent' : 'var(--green-dim)',
            color: 'var(--green)', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
          }}>
            {loading && <span style={{ width: 10, height: 10, border: '1.5px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />}
            {loading ? 'generating...' : '✦ generate post'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="fade-up fade-up-2" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24
      }}>
        {[
          ['include numbers', 'e.g. "3TB cluster", "42 apps", "zero downtime"'],
          ['mention tools', 'e.g. "using MongoDB operators and Istio"'],
          ['describe the challenge', 'what was hard? what could go wrong?'],
          ['state the result', 'what was the outcome? what did you achieve?'],
        ].map(([title, hint]) => (
          <div key={title} style={{
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            fontSize: 11
          }}>
            <div style={{ color: 'var(--green)', marginBottom: 2 }}>→ {title}</div>
            <div style={{ color: 'var(--text-muted)' }}>{hint}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--red)', background: 'var(--red-dim)',
          color: 'var(--red)', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-mono)'
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {result && <OutputPanel result={result} mode="content" onResultChange={setResult} />}
    </div>
  )
}

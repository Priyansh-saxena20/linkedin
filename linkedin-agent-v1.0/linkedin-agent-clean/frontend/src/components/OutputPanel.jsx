import { useState } from 'react'
import { postToLinkedIn } from '../hooks/useApi'

export default function OutputPanel({ result, mode }) {
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [postError, setPostError] = useState(null)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const post = async () => {
    setPosting(true)
    setPostError(null)
    try {
      await postToLinkedIn(result)
      setPosted(true)
    } catch (e) {
      setPostError(e.message)
    } finally {
      setPosting(false)
    }
  }

  const canPost = mode !== 'job'

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
      animation: 'fadeUp 0.35s ease both'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'block' }} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            output.md
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copy} style={{
            fontSize: 11, padding: '4px 12px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-bright)', background: 'transparent',
            color: copied ? 'var(--green)' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'var(--font-mono)'
          }}>
            {copied ? '✓ copied' : 'copy'}
          </button>
          {canPost && !posted && (
            <button onClick={post} disabled={posting} style={{
              fontSize: 11, padding: '4px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent)',
              background: posting ? 'transparent' : 'var(--accent-dim)',
              color: 'var(--accent)', cursor: posting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6
            }}>
              {posting && <span style={{ width: 8, height: 8, border: '1.5px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />}
              {posting ? 'posting...' : '↑ post to linkedin'}
            </button>
          )}
          {posted && (
            <span style={{ fontSize: 11, color: 'var(--green)', padding: '4px 12px', fontFamily: 'var(--font-mono)' }}>
              ✓ posted!
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px', fontSize: 13, lineHeight: 1.8,
        color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
        maxHeight: 500, overflowY: 'auto', fontFamily: 'var(--font-mono)'
      }}>
        {result}
      </div>

      {postError && (
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border)',
          fontSize: 12, color: 'var(--red)', background: 'var(--red-dim)'
        }}>
          ⚠ {postError}
        </div>
      )}

      {mode === 'job' && (
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border)',
          fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
        }}>
          💡 copy the recruiter message and send it manually on linkedin
        </div>
      )}
    </div>
  )
}

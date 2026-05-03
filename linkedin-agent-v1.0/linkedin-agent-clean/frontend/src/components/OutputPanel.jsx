import { useState, useEffect, useCallback, useId } from 'react'
import { postToLinkedIn, refine } from '../hooks/useApi'
import VoiceDictationButton from './VoiceDictationButton'

const MAX_IMAGE_MB = 8

export default function OutputPanel({ result, mode, onResultChange }) {
  const fileInputId = useId()
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [postError, setPostError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState(null)
  const [mediaFile, setMediaFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    setPosted(false)
    setPostError(null)
    setMediaFile(null)
  }, [result])

  useEffect(() => {
    if (!mediaFile) {
      setPreviewUrl(null)
      return undefined
    }
    const u = URL.createObjectURL(mediaFile)
    setPreviewUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [mediaFile])

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onPickMedia = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(f.type)) {
      setPostError('Please choose a JPEG, PNG, GIF, or WEBP image.')
      return
    }
    if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
      setPostError(`Image must be under ${MAX_IMAGE_MB} MB.`)
      return
    }
    setPostError(null)
    setMediaFile(f)
  }

  const post = async () => {
    setPosting(true)
    setPostError(null)
    try {
      await postToLinkedIn(result, mediaFile || undefined)
      setPosted(true)
      setMediaFile(null)
    } catch (e) {
      setPostError(e.message)
    } finally {
      setPosting(false)
    }
  }

  const appendRefineVoice = useCallback((text) => {
    const t = (text || '').trim()
    if (!t) return
    setRefineInput((prev) => {
      if (!prev) return t
      const sep = /\s$/.test(prev) ? '' : ' '
      return prev + sep + t
    })
  }, [])

  const applyRefine = async () => {
    if (!onResultChange || !refineInput.trim()) return
    setRefining(true)
    setRefineError(null)
    try {
      const data = await refine(result, refineInput.trim())
      onResultChange(data.result)
      setRefineInput('')
    } catch (e) {
      setRefineError(e.message)
    } finally {
      setRefining(false)
    }
  }

  const canPost = mode !== 'job'
  const showRefine = typeof onResultChange === 'function'

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
              border: '1px solid var(--green)',
              background: posting ? 'transparent' : 'var(--green-dim)',
              color: 'var(--green)', cursor: posting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6
            }}>
              {posting && <span style={{ width: 8, height: 8, border: '1.5px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', display: 'block', animation: 'spin 0.7s linear infinite' }} />}
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

      {canPost && !posted && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 16px',
          background: 'var(--bg-card)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.3 }}>
            Optional image with this post — JPEG, PNG, GIF, or WEBP (max {MAX_IMAGE_MB} MB). Video files are not supported yet.
          </div>
          <input
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={onPickMedia}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <label
              htmlFor={fileInputId}
              style={{
                fontSize: 11,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-bright)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                background: 'var(--bg-elevated)',
              }}
            >
              + attach image
            </label>
            {mediaFile && (
              <>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt=""
                    style={{ maxHeight: 56, maxWidth: 100, borderRadius: 6, border: '1px solid var(--border)' }}
                  />
                )}
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mediaFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setMediaFile(null)}
                  style={{
                    fontSize: 11,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--red)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  remove
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showRefine && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 16px 16px',
          background: 'var(--bg-card)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: 0.8, marginBottom: 8 }}>
            REFINE — follow-up (keeps full draft in context)
          </div>
          <textarea
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            placeholder="e.g. Shorter opening, add 2 more emojis, make the CTA softer, fix the hook…"
            rows={3}
            style={{
              width: '100%', padding: '12px', marginBottom: 10,
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.6,
              resize: 'vertical', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <VoiceDictationButton onAppend={appendRefineVoice} disabled={refining} />
            <button
              type="button"
              onClick={applyRefine}
              disabled={refining || !refineInput.trim()}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--accent)',
                background: refining || !refineInput.trim() ? 'transparent' : 'var(--accent-dim)',
                color: 'var(--accent)', cursor: refining || !refineInput.trim() ? 'not-allowed' : 'pointer',
                fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              {refining && (
                <span style={{
                  width: 10, height: 10, border: '1.5px solid var(--accent)', borderTopColor: 'transparent',
                  borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
              )}
              {refining ? 'revising…' : 'apply edits'}
            </button>
          </div>
          {refineError && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
              ⚠ {refineError}
            </div>
          )}
        </div>
      )}

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

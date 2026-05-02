import { useRef, useState, useCallback } from 'react'
import { Mic, Square } from 'lucide-react'

/**
 * Browser Web Speech API — appends transcribed text to the parent textarea state.
 * Works best in Chromium-based browsers; Safari may need webkit prefix (handled).
 */
export default function VoiceDictationButton({ onAppend, disabled }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const stop = useCallback(() => {
    try {
      recRef.current?.stop()
    } catch {
      /* ignore */
    }
    recRef.current = null
    setListening(false)
  }, [])

  const start = useCallback(() => {
    stop()
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      window.alert(
        'Voice input is not supported in this browser. Try Google Chrome or Microsoft Edge.'
      )
      return
    }
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.interimResults = false
    rec.continuous = true
    rec.onresult = (ev) => {
      let chunk = ''
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        chunk += ev.results[i][0].transcript
      }
      if (chunk) onAppend(chunk)
    }
    rec.onerror = () => stop()
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }, [onAppend, stop])

  const toggle = () => {
    if (disabled) return
    if (listening) stop()
    else start()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? 'Stop dictation' : 'Voice to text (microphone)'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${listening ? 'var(--red)' : 'var(--border-bright)'}`,
        background: listening ? 'var(--red-dim)' : 'var(--bg-elevated)',
        color: listening ? 'var(--red)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {listening ? <Square size={14} /> : <Mic size={14} />}
      {listening ? 'stop' : 'voice'}
    </button>
  )
}

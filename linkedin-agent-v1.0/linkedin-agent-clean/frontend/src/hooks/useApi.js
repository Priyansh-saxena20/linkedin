const BASE = '/api'

export async function checkStatus() {
  const r = await fetch(`${BASE}/status`)
  if (!r.ok) throw new Error('Backend unreachable')
  return r.json()
}

export async function generate(mode, input) {
  const r = await fetch(`${BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, input })
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.detail || 'Generation failed')
  }
  return r.json()
}

export async function refine(currentText, instruction) {
  const r = await fetch(`${BASE}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_text: currentText, instruction })
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.detail || 'Refine failed')
  }
  return r.json()
}

export async function postToLinkedIn(text, file) {
  if (file) {
    const fd = new FormData()
    fd.append('text', text)
    fd.append('media', file, file.name)
    const r = await fetch(`${BASE}/post-to-linkedin`, {
      method: 'POST',
      body: fd
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      const d = err.detail
      throw new Error(typeof d === 'string' ? d : JSON.stringify(d) || 'Post failed')
    }
    return r.json()
  }
  const r = await fetch(`${BASE}/post-to-linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err.detail || 'Post failed')
  }
  return r.json()
}

const MODES = [
  {
    id: 'content',
    icon: '✦',
    label: 'Content',
    sub: 'Work → Post',
    color: 'var(--green)',
    dim: 'var(--green-dim)'
  },
  {
    id: 'brand',
    icon: '◈',
    label: 'Brand',
    sub: 'Events → Story',
    color: 'var(--purple)',
    dim: 'var(--purple-dim)'
  },
  {
    id: 'job',
    icon: '⊕',
    label: 'Job Hunt',
    sub: 'JD → Apply',
    color: 'var(--amber)',
    dim: 'var(--amber-dim)'
  },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-card)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 12px'
    }}>
      {/* Logo — acts as Home */}
      <div style={{ padding: '0 12px 28px', borderBottom: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => onSelect('home')}
          title="Home"
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px'
          }}>
            AGENT<span style={{ color: 'var(--accent)' }}>_</span>PS
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            priyansh saxena · dt digital labs
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', padding: '0 12px', marginBottom: 8, letterSpacing: 1 }}>
          MODES
        </div>
        {MODES.map(m => {
          const isActive = active === m.id
          return (
            <button key={m.id} onClick={() => onSelect(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              border: isActive ? `1px solid ${m.color}30` : '1px solid transparent',
              background: isActive ? m.dim : 'transparent',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.15s ease'
            }}>
              <span style={{
                fontSize: 16, color: isActive ? m.color : 'var(--text-muted)',
                width: 20, textAlign: 'center'
              }}>{m.icon}</span>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-display)',
                  color: isActive ? m.color : 'var(--text-secondary)'
                }}>{m.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                  {m.sub}
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      <div style={{
        padding: '12px', marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-muted)',
        lineHeight: 1.6
      }}>
        <div>🤖 powered by ai</div>
      </div>
    </aside>
  )
}

export default function Header({ profile, onShare, onViewChange, activeView, shareLoading }) {
  return (
    <header className="app-header" style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      borderBottom: 'none',
    }}>
      <div className="container header-inner">
        <div className="logo">
          <span className="logo-icon" style={{ color: '#fff' }}>⚡</span>
          <span className="logo-text" style={{ color: '#fff' }}>TechFolio</span>
        </div>
        <nav className="header-nav">
          <button
            className="nav-btn"
            style={{
              color: activeView === 'projects' ? '#fff' : 'rgba(255,255,255,.75)',
              background: activeView === 'projects' ? 'rgba(255,255,255,.2)' : 'transparent',
            }}
            onClick={() => onViewChange('projects')}
          >
            Projects
          </button>
          <button
            className="nav-btn"
            style={{
              color: activeView === 'profile' ? '#fff' : 'rgba(255,255,255,.75)',
              background: activeView === 'profile' ? 'rgba(255,255,255,.2)' : 'transparent',
            }}
            onClick={() => onViewChange('profile')}
          >
            Profile
          </button>
        </nav>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button
            onClick={() => { window.location.hash = '#/preview'; }}
            style={{
              background: 'rgba(255,255,255,.15)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,.4)',
              padding: '.5rem 1.1rem',
              borderRadius: '6px',
              fontSize: '.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >Preview</button>
          <button
            onClick={onShare}
            style={{
              background: '#fff',
              color: '#4f46e5',
              border: 'none',
              padding: '.5rem 1.2rem',
              borderRadius: '6px',
              fontSize: '.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            }}
          >{shareLoading ? 'Saving...' : 'Share Portfolio ↗'}</button>
        </div>
      </div>
    </header>
  );
}

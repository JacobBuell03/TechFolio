import { useState, useEffect } from 'react';
import { parseShareHash } from './utils/share';
import { loadData } from './utils/storage';
import { loadPortfolio } from './utils/supabase';
import Dashboard from './pages/Dashboard';
import PublicPortfolio from './pages/PublicPortfolio';

export default function App() {
  const [view, setView] = useState(null); // null | 'shared' | 'preview' | 'loading' | 'error'
  const [sharedData, setSharedData] = useState(null);

  useEffect(() => {
    async function checkHash() {
      const hash = window.location.hash;

      if (hash === '#/preview') {
        setView('preview');
        setSharedData(null);
        return;
      }

      // Short link: #/p/[id]
      const shortMatch = hash.match(/^#\/p\/(.+)$/);
      if (shortMatch) {
        setView('loading');
        try {
          const data = await loadPortfolio(shortMatch[1]);
          if (data) { setSharedData(data); setView('shared'); }
          else setView('error');
        } catch { setView('error'); }
        return;
      }

      // Legacy long link: #/portfolio/[base64]
      const data = parseShareHash(hash);
      if (data) { setSharedData(data); setView('shared'); return; }

      setSharedData(null);
      setView(null);
    }

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (view === 'loading') return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f1117', color:'#9ca3af', fontSize:'1.1rem' }}>
      Loading portfolio…
    </div>
  );

  if (view === 'error') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f1117', color:'#9ca3af', gap:'1rem' }}>
      <p style={{ fontSize:'1.1rem' }}>Portfolio not found or link has expired.</p>
      <button onClick={() => { window.location.hash = ''; }} style={{ padding:'.5rem 1.2rem', background:'#4f46e5', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>Go Home</button>
    </div>
  );

  if (view === 'shared' && sharedData) return <PublicPortfolio data={sharedData} />;
  if (view === 'preview') return <PublicPortfolio data={loadData()} />;
  return <Dashboard />;
}

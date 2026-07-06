import { useState, useRef, useEffect } from 'react';

const CATEGORY_COLORS = {
  'Undergraduate':            '#3b82f6',
  'Masters':                  '#8b5cf6',
  'Doctorate':                '#6366f1',
  'Professional Career':      '#10b981',
  'Personal Project':         '#f59e0b',
  'Bootcamp / Certification': '#06b6d4',
  'Other':                    '#6b7280',
};

// Convert Google Drive share links to embeddable preview URLs
function toEmbedUrl(url) {
  if (!url) return '';
  // https://drive.google.com/file/d/FILE_ID/view → /preview
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  // https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  return url;
}

function formatDate(str) {
  if (!str) return '';
  const [year, month] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export default function PublicPortfolio({ data }) {
  const { profile, projects } = data;
  const [activeTab, setActiveTab] = useState('profile');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const usedCategories = [...new Set(projects.map(p => p.category).filter(Boolean))];
  const visibleProjects = activeTab === 'profile' ? [] : projects.filter(p => p.category === activeTab);
  const certifications = (Array.isArray(profile.certifications) ? [...profile.certifications] : []).sort((a, b) => {
    // Sort by issue date descending (most recent first)
    return (b.issueDate || '').localeCompare(a.issueDate || '');
  });
  const education = (Array.isArray(profile.education) ? [...profile.education] : []).sort((a, b) => {
    // Expected/in-progress (no endDate or expected=true) floats to top
    const aActive = !a.endDate || a.expected;
    const bActive = !b.endDate || b.expected;
    if (aActive !== bActive) return aActive ? -1 : 1;
    // Otherwise sort by endDate desc, fall back to startDate
    const aDate = a.endDate || a.startDate || '';
    const bDate = b.endDate || b.startDate || '';
    return bDate.localeCompare(aDate);
  });
  const experience = (Array.isArray(profile.experience) ? [...profile.experience] : []).sort((a, b) => {
    // Current jobs float to top
    if (a.current !== b.current) return a.current ? -1 : 1;
    // Otherwise sort by startDate desc
    const aDate = a.startDate || '';
    const bDate = b.startDate || '';
    return bDate.localeCompare(aDate);
  });

  function goBack() { window.location.hash = ''; }

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f1117' }}>

      {/* ── HERO SECTION ── */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '3rem',
      }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', width:420, height:420, borderRadius:'50%', background:'#818cf8', filter:'blur(70px)', opacity:.2, top:-120, right:-80, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', background:'#c084fc', filter:'blur(60px)', opacity:.2, bottom:-60, left:'8%', pointerEvents:'none' }} />

        {/* Nav */}
        <nav style={{ borderBottom:'1px solid rgba(255,255,255,.15)', position:'relative', zIndex:10 }}>
          <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 1.5rem', display:'flex', alignItems:'center', justifyContent:'center', height:56, gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.6rem', overflow:'visible' }}>
              {/* Profile tab */}
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  background: activeTab === 'profile' ? '#fff' : 'rgba(255,255,255,.12)',
                  color: activeTab === 'profile' ? '#4f46e5' : 'rgba(255,255,255,.85)',
                  border: '1.5px solid ' + (activeTab === 'profile' ? '#fff' : 'rgba(255,255,255,.25)'),
                  padding: '.4rem 1.1rem',
                  borderRadius: 99,
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  fontSize: '.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >Profile</button>

              {/* Resume tab */}
              {profile.resumeUrl && (
                <button
                  onClick={() => setActiveTab('resume')}
                  style={{
                    background: activeTab === 'resume' ? '#fff' : 'rgba(255,255,255,.12)',
                    color: activeTab === 'resume' ? '#4f46e5' : 'rgba(255,255,255,.85)',
                    border: '1.5px solid ' + (activeTab === 'resume' ? '#fff' : 'rgba(255,255,255,.25)'),
                    padding: '.4rem 1.1rem',
                    borderRadius: 99,
                    fontWeight: activeTab === 'resume' ? 700 : 500,
                    fontSize: '.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >📄 Resume</button>
              )}

              {/* Projects dropdown */}
              {usedCategories.length > 0 && (
                <div ref={dropdownRef} style={{ position:'relative', display:'flex', alignItems:'center' }}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      background: usedCategories.includes(activeTab) ? '#fff' : 'rgba(255,255,255,.12)',
                      color: usedCategories.includes(activeTab) ? '#4f46e5' : 'rgba(255,255,255,.85)',
                      border: '1.5px solid ' + (usedCategories.includes(activeTab) ? '#fff' : 'rgba(255,255,255,.25)'),
                      padding: '.4rem 1.1rem',
                      borderRadius: 99,
                      fontWeight: usedCategories.includes(activeTab) ? 700 : 500,
                      fontSize: '.875rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.4rem',
                    }}
                  >
                    {usedCategories.includes(activeTab) ? activeTab : 'Projects'}
                    <span style={{ fontSize: '.6rem', opacity: .7 }}>{dropdownOpen ? '▲' : '▼'}</span>
                  </button>
                  {dropdownOpen && (
                    <div style={{
                      position:'absolute', top:'calc(100% + .5rem)', left:0,
                      background:'#1a1d27', border:'1.5px solid #2d3141',
                      borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.4)',
                      minWidth:210, zIndex:300, overflow:'hidden',
                    }}>
                      {usedCategories.map((cat, i) => (
                        <button
                          key={cat}
                          onClick={() => { setActiveTab(cat); setDropdownOpen(false); }}
                          style={{
                            display:'flex', alignItems:'center', gap:'.6rem',
                            width:'100%', background: activeTab === cat ? '#1e1b4b' : 'transparent',
                            border:'none', borderTop: i > 0 ? '1px solid #2d3141' : 'none',
                            padding:'.65rem 1rem', textAlign:'left', fontSize:'.875rem',
                            color: activeTab === cat ? '#818cf8' : '#9ca3af',
                            cursor:'pointer', fontWeight: activeTab === cat ? 600 : 400,
                          }}
                        >
                          <span style={{ width:8, height:8, borderRadius:'50%', background: CATEGORY_COLORS[cat] || '#4f46e5', flexShrink:0 }} />
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero content — centered */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 1.5rem', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', paddingTop:'2.5rem', gap:'.75rem', position:'relative', zIndex:5 }}>
          {/* Avatar */}
          <div style={{ marginTop:20, marginBottom:'.25rem' }}>
            {profile.photo
              ? <img src={profile.photo} alt={profile.name} style={{ width:120, height:120, borderRadius:'50%', objectFit:'cover', border:'4px solid rgba(255,255,255,.5)', boxShadow:'0 8px 32px rgba(0,0,0,.3)', display:'block' }} />
              : <div style={{ width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.18)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', fontWeight:800, border:'4px solid rgba(255,255,255,.5)', boxShadow:'0 8px 32px rgba(0,0,0,.2)' }}>{initials}</div>
            }
          </div>

          {profile.name && <h1 style={{ fontSize:'2.75rem', fontWeight:800, color:'#fff', lineHeight:1.1, letterSpacing:'-.03em', margin:0 }}>{profile.name}</h1>}
          {profile.title && <p style={{ fontSize:'1.15rem', color:'rgba(255,255,255,.8)', fontWeight:500, margin:0 }}>{profile.title}</p>}

          {/* Contact links + Resume */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem', justifyContent:'center', marginTop:'.25rem' }}>
            {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{ padding:'.3rem .9rem', borderRadius:99, border:'1.5px solid rgba(255,255,255,.4)', color:'#fff', fontSize:'.82rem', fontWeight:500, textDecoration:'none', background:'rgba(255,255,255,.1)' }}>GitHub</a>}
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ padding:'.3rem .9rem', borderRadius:99, border:'1.5px solid rgba(255,255,255,.4)', color:'#fff', fontSize:'.82rem', fontWeight:500, textDecoration:'none', background:'rgba(255,255,255,.1)' }}>LinkedIn</a>}
            {profile.email && <a href={`mailto:${profile.email}`} style={{ padding:'.3rem .9rem', borderRadius:99, border:'1.5px solid rgba(255,255,255,.4)', color:'#fff', fontSize:'.82rem', fontWeight:500, textDecoration:'none', background:'rgba(255,255,255,.1)' }}>{profile.email}</a>}
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding:'.3rem .9rem', borderRadius:99, border:'1.5px solid rgba(255,255,255,.4)', color:'#fff', fontSize:'.82rem', fontWeight:500, textDecoration:'none', background:'rgba(255,255,255,.1)', display:'inline-flex', alignItems:'center', gap:'.3rem' }}
              >📄 Resume</a>
            )}
          </div>

          {/* Stats */}
          {projects.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginTop:'.75rem', background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:99, padding:'.6rem 2rem' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <span style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', lineHeight:1 }}>{projects.length}</span>
                <span style={{ fontSize:'.72rem', color:'rgba(255,255,255,.65)', textTransform:'uppercase', letterSpacing:'.06em' }}>Project{projects.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ width:1, height:36, background:'rgba(255,255,255,.25)' }} />
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <span style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', lineHeight:1 }}>{usedCategories.length}</span>
                <span style={{ fontSize:'.72rem', color:'rgba(255,255,255,.65)', textTransform:'uppercase', letterSpacing:'.06em' }}>Categor{usedCategories.length !== 1 ? 'ies' : 'y'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PROFILE VIEW ── */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 1.5rem 3rem', display:'flex', flexDirection:'column', gap:'1.25rem', width:'100%' }}>

          {/* About Me — full width */}
          {profile.bio && (
            <ProfileCard icon="👤" title="About Me">
              <p style={{ color:'#9ca3af', lineHeight:1.7, fontSize:'.95rem', margin:0 }}>{profile.bio}</p>
            </ProfileCard>
          )}

          {/* Education + Work Experience — side by side */}
          <div style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start' }}>

            {/* Education */}
            {education.length > 0 && (
              <div style={{ flex:1, minWidth:0 }}>
                <ProfileCard icon="🎓" title="Education">
                  {education.map((edu, idx) => (
                    <div key={edu.id} style={{ paddingTop: idx > 0 ? '1rem' : 0, marginTop: idx > 0 ? '1rem' : 0, borderTop: idx > 0 ? '1px solid #2d3141' : 'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.75rem', flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          {(edu.degree || edu.field) && (
                            <p style={{ fontWeight:700, color:'#f3f4f6', fontSize:'.9rem', margin:0 }}>
                              {[edu.degree, edu.field].filter(Boolean).join(' — ')}
                            </p>
                          )}
                          {edu.institution && (
                            <p style={{ color:'#818cf8', fontWeight:500, fontSize:'.82rem', margin:'.15rem 0 0' }}>{edu.institution}</p>
                          )}
                        </div>
                        {(edu.startDate || edu.endDate) && (
                          <span style={{ fontSize:'.78rem', color:'#6b7280', whiteSpace:'nowrap', flexShrink:0 }}>
                            {edu.startDate ? formatDate(edu.startDate) : ''}
                            {edu.startDate && edu.endDate ? ' – ' : ''}
                            {edu.endDate ? (edu.expected ? `Expected ${formatDate(edu.endDate)}` : formatDate(edu.endDate)) : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </ProfileCard>
              </div>
            )}

            {/* Work Experience */}
            {experience.length > 0 && (
              <div style={{ flex:1, minWidth:0 }}>
                <ProfileCard icon="💼" title="Work Experience">
                  {experience.map((exp, idx) => (
                    <div key={exp.id} style={{ paddingTop: idx > 0 ? '1rem' : 0, marginTop: idx > 0 ? '1rem' : 0, borderTop: idx > 0 ? '1px solid #2d3141' : 'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.75rem', flexWrap:'wrap' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          {exp.title && <p style={{ fontWeight:700, color:'#f3f4f6', fontSize:'.9rem', margin:0 }}>{exp.title}</p>}
                          {exp.company && <p style={{ color:'#818cf8', fontWeight:500, fontSize:'.82rem', margin:'.15rem 0 0' }}>{exp.company}</p>}
                        </div>
                        {(exp.startDate || exp.current || exp.endDate) && (
                          <span style={{ fontSize:'.78rem', color:'#6b7280', whiteSpace:'nowrap', flexShrink:0 }}>
                            {exp.startDate ? formatDate(exp.startDate) : ''}
                            {exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}
                            {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : ''}
                          </span>
                        )}
                      </div>
                      {exp.description && <p style={{ color:'#9ca3af', fontSize:'.82rem', lineHeight:1.65, margin:'.5rem 0 0' }}>{exp.description}</p>}
                    </div>
                  ))}
                </ProfileCard>
              </div>
            )}

          </div>{/* end side-by-side row */}

          {/* Certifications & Licenses — full width */}
          {certifications.length > 0 && (
            <ProfileCard icon="🏅" title="Certifications & Licenses">
              <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem' }}>
                {certifications.map((cert, idx) => (
                  <div key={cert.id} style={{
                    flex:'1 1 260px', background:'#13151f', border:'1px solid #2d3141',
                    borderRadius:8, padding:'1rem 1.1rem',
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'.5rem' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        {cert.url
                          ? <a href={cert.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight:700, color:'#a5b4fc', fontSize:'.9rem', textDecoration:'none' }}>{cert.name}</a>
                          : <p style={{ fontWeight:700, color:'#f3f4f6', fontSize:'.9rem', margin:0 }}>{cert.name}</p>
                        }
                        {cert.issuer && <p style={{ color:'#818cf8', fontWeight:500, fontSize:'.82rem', margin:'.15rem 0 0' }}>{cert.issuer}</p>}
                      </div>
                      {cert.noExpiry && (
                        <span style={{ fontSize:'.7rem', background:'#14532d', color:'#86efac', padding:'.15rem .5rem', borderRadius:99, whiteSpace:'nowrap', flexShrink:0 }}>No Expiry</span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:'1rem', marginTop:'.6rem', flexWrap:'wrap' }}>
                      {cert.issueDate && (
                        <span style={{ fontSize:'.75rem', color:'#6b7280' }}>Issued {formatDate(cert.issueDate)}</span>
                      )}
                      {cert.expiryDate && !cert.noExpiry && (
                        <span style={{ fontSize:'.75rem', color:'#6b7280' }}>Expires {formatDate(cert.expiryDate)}</span>
                      )}
                      {cert.credentialId && (
                        <span style={{ fontSize:'.75rem', color:'#6b7280' }}>ID: {cert.credentialId}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ProfileCard>
          )}

          {/* Skills */}
          {Array.isArray(profile.skills) && profile.skills.length > 0 && (
            <ProfileCard icon="⚡" title="Skills">
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem' }}>
                {profile.skills.map((skill, i) => {
                  const hue = (skill.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 37) % 360;
                  return (
                    <span key={skill} style={{
                      padding:'.3rem .85rem', borderRadius:99,
                      background:`hsla(${hue},60%,30%,.5)`,
                      border:`1px solid hsla(${hue},70%,55%,.4)`,
                      color:`hsl(${hue},80%,75%)`,
                      fontSize:'.82rem', fontWeight:600,
                    }}>{skill}</span>
                  );
                })}
              </div>
            </ProfileCard>
          )}

          {/* Project category chips */}
          {usedCategories.length > 0 && (
            <div style={{ background:'#1a1d27', border:'1px solid #2d3141', borderRadius:10, padding:'1.5rem 1.75rem' }}>
              <p style={{ fontWeight:600, fontSize:'.9rem', color:'#f3f4f6', marginBottom:'.85rem' }}>Explore projects by category</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.6rem' }}>
                {usedCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    style={{
                      padding:'.4rem 1rem', borderRadius:99,
                      border:`2px solid ${CATEGORY_COLORS[cat] || '#4f46e5'}`,
                      background:'transparent', color: CATEGORY_COLORS[cat] || '#4f46e5',
                      fontSize:'.85rem', fontWeight:600, cursor:'pointer',
                    }}
                  >{cat}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RESUME VIEW ── */}
      {activeTab === 'resume' && profile.resumeUrl && (
        <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.25rem 1.5rem 3rem', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <h2 style={{ margin:0, color:'#f3f4f6' }}>📄 Resume</h2>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding:'.45rem 1.1rem', borderRadius:8, background:'#4f46e5', color:'#fff', fontSize:'.875rem', fontWeight:600, textDecoration:'none' }}
            >↗ Open</a>
          </div>
          <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #2d3141', background:'#1a1d27' }}>
            <iframe
              src={toEmbedUrl(profile.resumeUrl)}
              title="Resume"
              style={{ width:'100%', height:'82vh', border:'none', display:'block' }}
            />
          </div>
        </main>
      )}

      {/* ── PROJECTS VIEW ── */}
      {usedCategories.includes(activeTab) && (
        <main style={{ maxWidth:1100, margin:'0 auto', padding:'2.25rem 1.5rem 3rem', width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.65rem' }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background: CATEGORY_COLORS[activeTab] || '#4f46e5' }} />
              <h2 style={{ margin:0 }}>{activeTab}</h2>
            </div>
            <span style={{ fontSize:'.875rem', color:'#6b7280' }}>{visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="projects-grid">
            {visibleProjects.map(project => (
              <PublicProjectCard key={project.id} project={project} />
            ))}
          </div>
        </main>
      )}

      <footer style={{ textAlign:'center', padding:'2rem', borderTop:'1px solid #2d3141', fontSize:'.85rem', color:'#6b7280', marginTop:'auto' }}>
        <p>Built with <a href="#" onClick={e => { e.preventDefault(); goBack(); }} style={{ color:'#818cf8' }}>TechFolio</a> — showcase your projects in minutes.</p>
      </footer>
    </div>
  );
}

function ProfileCard({ icon, title, children }) {
  return (
    <div style={{ background:'#1a1d27', border:'1px solid #2d3141', borderRadius:10, padding:'1.75rem', boxShadow:'0 1px 3px rgba(0,0,0,.3)', display:'flex', gap:'1.25rem', alignItems:'flex-start' }}>
      <div style={{ width:44, height:44, borderRadius:8, background:'#1e1b4b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <h2 style={{ fontSize:'1.05rem', fontWeight:700, color:'#f3f4f6', marginBottom:'.75rem' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function PublicProjectCard({ project }) {
  const accentColor = CATEGORY_COLORS[project.category] || '#4f46e5';
  return (
    <article className="project-card" style={{ '--card-accent': accentColor }}>
      <div className="card-accent-bar" />
      {project.imageUrl && (
        <div className="card-image">
          <img src={project.imageUrl} alt={project.title} loading="lazy" />
        </div>
      )}
      <div className="card-body">
        <div className="card-header">
          <h3>{project.title}</h3>
          {project.status && (
            <span className={`status-badge status-${project.status.replace(/ /g, '-')}`}>{project.status}</span>
          )}
        </div>
        {project.category && <span className="cat-label" style={{ color: accentColor }}>{project.category}</span>}
        {project.description && <p className="card-description">{project.description}</p>}
        {project.tags && project.tags.length > 0 && (
          <div className="tag-list">
            {project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
        <div className="card-links">
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="card-link">GitHub</a>}
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="card-link card-link-primary">Live Demo ↗</a>}
        </div>
      </div>
    </article>
  );
}

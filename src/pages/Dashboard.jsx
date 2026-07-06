import { useState, useEffect } from 'react';
import { loadData, saveData, generateId } from '../utils/storage';
import { buildShareUrl } from '../utils/share';
import { savePortfolio, isConfigured } from '../utils/supabase';
import { deleteFilesForProject } from '../utils/fileStorage';
import Header from '../components/Header';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import ProfileForm from '../components/ProfileForm';
import ShareModal from '../components/ShareModal';
import CategoryTabs from '../components/CategoryTabs';

export default function Dashboard() {
  const [data, setData] = useState(() => loadData());
  const [view, setView] = useState('projects');
  const [editingProject, setEditingProject] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { saveData(data); }, [data]);

  // Build list of categories that actually have projects, in a stable order
  const usedCategories = [...new Set(data.projects.map(p => p.category).filter(Boolean))];

  const visibleProjects = activeCategory === 'All'
    ? data.projects
    : data.projects.filter(p => p.category === activeCategory);

  function handleSaveProject(projectData) {
    if (editingProject === 'new') {
      const newProject = { ...projectData, id: generateId(), createdAt: Date.now() };
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    } else {
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p =>
          p.id === editingProject.id ? { ...editingProject, ...projectData } : p
        ),
      }));
    }
    setEditingProject(null);
  }

  async function handleDeleteProject(id) {
    if (!confirm('Delete this project and all its attachments?')) return;
    await deleteFilesForProject(id);
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  }

  function handleSaveProfile(profile) {
    setData(prev => ({ ...prev, profile }));
  }

  if (editingProject !== null) {
    return (
      <div className="app">
        <Header profile={data.profile} onShare={async () => {
          setShareLoading(true);
          try {
            if (isConfigured()) {
              const id = await savePortfolio(data);
              const base = window.location.origin + window.location.pathname;
              setShareUrl(`${base}#/p/${id}`);
            } else {
              setShareUrl(await buildShareUrl(data));
            }
          } catch (e) {
            alert('Could not generate share link: ' + e.message);
          }
          setShareLoading(false);
        }} shareLoading={shareLoading} onViewChange={setView} activeView={view} />
        <main className="container">
          <ProjectForm
            project={editingProject === 'new' ? null : editingProject}
            onSave={handleSaveProject}
            onCancel={() => setEditingProject(null)}
          />
        </main>
        {shareUrl && <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />}
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        profile={data.profile}
        onShare={async () => {
          setShareLoading(true);
          try {
            if (isConfigured()) {
              const id = await savePortfolio(data);
              const base = window.location.origin + window.location.pathname;
              setShareUrl(`${base}#/p/${id}`);
            } else {
              setShareUrl(await buildShareUrl(data));
            }
          } catch (e) {
            alert('Could not generate share link: ' + e.message);
          }
          setShareLoading(false);
        }}
        shareLoading={shareLoading}
        onViewChange={setView}
        activeView={view}
      />
      {view === 'projects' && (
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '2.25rem 0',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
                {data.profile.name ? `Welcome back, ${data.profile.name.split(' ')[0]}!` : 'Welcome to TechFolio'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.95rem', marginTop: '.3rem' }}>
                {data.projects.length === 0
                  ? 'Start adding projects to build your portfolio.'
                  : `${data.projects.length} project${data.projects.length !== 1 ? 's' : ''} in your portfolio`}
              </p>
            </div>
            <button
              onClick={() => setEditingProject('new')}
              style={{
                background: '#fff',
                color: '#4f46e5',
                border: 'none',
                padding: '.65rem 1.4rem',
                borderRadius: '6px',
                fontSize: '.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 10px rgba(0,0,0,.15)',
              }}
            >
              + Add Project
            </button>
          </div>
        </div>
      )}

      <main className="container">
        {view === 'profile' ? (
          <ProfileForm profile={data.profile} onSave={handleSaveProfile} />
        ) : (
          <section className="projects-section">
            <div className="section-header" style={{ marginBottom: data.projects.length > 0 ? undefined : '1.5rem' }}>
              <h2>My Projects</h2>
            </div>

            {data.projects.length > 0 && (
              <CategoryTabs
                categories={usedCategories}
                active={activeCategory}
                onChange={setActiveCategory}
              />
            )}

            {data.projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚀</div>
                <h3>No projects yet</h3>
                <p>Add your first project to start building your portfolio.</p>
                <button className="btn btn-primary" onClick={() => setEditingProject('new')}>
                  Add Your First Project
                </button>
              </div>
            ) : visibleProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No projects in this category</h3>
                <p>Try a different category or add a new project.</p>
              </div>
            ) : (
              <div className="projects-grid">
                {visibleProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => setEditingProject(project)}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      {shareUrl && <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />}
    </div>
  );
}

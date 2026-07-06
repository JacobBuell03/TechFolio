import { useState, useEffect } from 'react';
import { getFilesForProject, downloadFile, formatFileSize, fileIcon } from '../utils/fileStorage';

const CATEGORY_COLORS = {
  'Undergraduate':          '#3b82f6',
  'Masters':                '#8b5cf6',
  'Doctorate':              '#6366f1',
  'Professional Career':    '#10b981',
  'Personal Project':       '#f59e0b',
  'Bootcamp / Certification': '#06b6d4',
  'Other':                  '#6b7280',
};

export default function ProjectCard({ project, onEdit, onDelete }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    getFilesForProject(project.id).then(setFiles).catch(() => {});
  }, [project.id]);

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
            <span className={`status-badge status-${project.status.replace(/ /g, '-')}`}>
              {project.status}
            </span>
          )}
        </div>
        {project.category && (
          <span className="cat-label" style={{ color: accentColor }}>{project.category}</span>
        )}
        {project.description && <p className="card-description">{project.description}</p>}
        {project.tags && project.tags.length > 0 && (
          <div className="tag-list">
            {project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
        {files.length > 0 && (
          <div className="card-files">
            <span className="card-files-label">Attachments</span>
            <ul className="file-list file-list-compact">
              {files.map(f => (
                <li key={f.id} className="file-item file-item-compact">
                  <span className="file-icon">{fileIcon(f.type)}</span>
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{formatFileSize(f.size)}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => downloadFile(f)}
                    title="Download"
                  >
                    ↓
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="card-links">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="card-link">
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="card-link card-link-primary">
              Live Demo ↗
            </a>
          )}
        </div>
        <div className="card-actions">
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
        </div>
      </div>
    </article>
  );
}

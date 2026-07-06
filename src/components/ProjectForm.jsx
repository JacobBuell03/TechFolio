import { useState, useEffect, useRef } from 'react';
import { saveFile, getFilesForProject, deleteFile, formatFileSize, fileIcon } from '../utils/fileStorage';

const STATUS_OPTIONS = ['In Progress', 'Completed', 'On Hold'];

export const CATEGORIES = [
  'Undergraduate',
  'Masters',
  'Doctorate',
  'Professional Career',
  'Personal Project',
  'Bootcamp / Certification',
  'Other',
];

const ACCEPTED_TYPES = [
  '.pdf', '.ppt', '.pptx', '.xls', '.xlsx', '.csv',
  '.doc', '.docx', '.txt', '.zip', '.png', '.jpg', '.jpeg', '.gif', '.mp4',
].join(',');

export default function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'Completed',
    category: project?.category || CATEGORIES[0],
    tags: project?.tags?.join(', ') || '',
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    imageUrl: project?.imageUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (project?.id) {
      getFilesForProject(project.id).then(setFiles).catch(() => {});
    }
  }, [project?.id]);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  }

  async function handleFiles(fileList) {
    if (!project?.id) {
      alert('Save the project first before uploading files.');
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        await saveFile(project.id, file);
      }
      const updated = await getFilesForProject(project.id);
      setFiles(updated);
    } catch (err) {
      alert('Failed to save file: ' + err.message);
    }
    setUploading(false);
  }

  async function handleRemoveFile(fileId) {
    await deleteFile(fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      category: form.category,
      tags,
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      imageUrl: form.imageUrl.trim(),
    });
  }

  const isNew = !project;

  return (
    <div className="form-page">
      <div className="form-header">
        <h2>{isNew ? 'Add Project' : 'Edit Project'}</h2>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Project Title *</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Personal Finance Tracker"
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <span className="error-msg">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What does this project do? What problem does it solve?"
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tech Stack / Tags</label>
          <input
            id="tags"
            type="text"
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
            placeholder="React, Node.js, PostgreSQL (comma separated)"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="githubUrl">GitHub URL</label>
            <input
              id="githubUrl"
              type="url"
              value={form.githubUrl}
              onChange={e => set('githubUrl', e.target.value)}
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div className="form-group">
            <label htmlFor="liveUrl">Live Demo URL</label>
            <input
              id="liveUrl"
              type="url"
              value={form.liveUrl}
              onChange={e => set('liveUrl', e.target.value)}
              placeholder="https://myproject.vercel.app"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Project Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={e => set('imageUrl', e.target.value)}
            placeholder="https://i.imgur.com/... (screenshot or preview image)"
          />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview" className="image-preview"
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>

        <div className="form-group">
          <label>File Attachments</label>
          {isNew ? (
            <p className="upload-new-note">Save the project first, then edit it to attach files.</p>
          ) : (
            <>
              <div
                className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="drop-icon">📁</span>
                <span>{uploading ? 'Uploading...' : 'Drop files here or click to browse'}</span>
                <span className="drop-hint">PDF, PowerPoint, Excel, Word, images, and more</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />
              {files.length > 0 && (
                <ul className="file-list">
                  {files.map(f => (
                    <li key={f.id} className="file-item">
                      <span className="file-icon">{fileIcon(f.type)}</span>
                      <span className="file-name">{f.name}</span>
                      <span className="file-size">{formatFileSize(f.size)}</span>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveFile(f.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            {isNew ? 'Add Project' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

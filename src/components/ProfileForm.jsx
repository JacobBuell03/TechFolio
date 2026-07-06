import { useState, useRef } from 'react';
import { generateId } from '../utils/storage';

function resizeImage(file, maxSize = 400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const DEGREES = [
  '', 'High School Diploma', 'Associate of Arts (A.A.)', 'Associate of Science (A.S.)',
  'Bachelor of Arts (B.A.)', 'Bachelor of Science (B.S.)', 'Master of Arts (M.A.)',
  'Master of Science (M.S.)', 'Master of Business Administration (MBA)',
  'Doctor of Philosophy (Ph.D.)', 'Doctor of Medicine (M.D.)', 'Juris Doctor (J.D.)',
  'Bootcamp Certificate', 'Professional Certificate', 'Other',
];

function newEdu() {
  return { id: generateId(), institution: '', degree: '', field: '', startDate: '', endDate: '', expected: false };
}
function newExp() {
  return { id: generateId(), company: '', title: '', startDate: '', endDate: '', current: false, description: '' };
}
function newCert() {
  return { id: generateId(), name: '', issuer: '', issueDate: '', expiryDate: '', noExpiry: false, credentialId: '', url: '' };
}

export default function ProfileForm({ profile, onSave }) {
  const [form, setForm] = useState({
    ...profile,
    education: Array.isArray(profile.education) ? profile.education : [],
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    resumeUrl: profile.resumeUrl || '',
  });
  const [saved, setSaved] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const photoRef = useRef();

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  // Education
  function addEdu() { set('education', [...form.education, newEdu()]); }
  function updateEdu(id, field, value) {
    set('education', form.education.map(e => e.id === id ? { ...e, [field]: value } : e));
  }
  function removeEdu(id) { set('education', form.education.filter(e => e.id !== id)); }

  // Certifications
  function addCert() { set('certifications', [...form.certifications, newCert()]); }
  function updateCert(id, field, value) {
    set('certifications', form.certifications.map(c => c.id === id ? { ...c, [field]: value } : c));
  }
  function removeCert(id) { set('certifications', form.certifications.filter(c => c.id !== id)); }

  // Experience
  function addExp() { set('experience', [...form.experience, newExp()]); }
  function updateExp(id, field, value) {
    set('experience', form.experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  }
  function removeExp(id) { set('experience', form.experience.filter(e => e.id !== id)); }

  // Skills
  function addSkill(raw) {
    const skill = raw.trim();
    if (!skill || form.skills.includes(skill)) return;
    set('skills', [...form.skills, skill]);
  }
  function removeSkill(skill) { set('skills', form.skills.filter(s => s !== skill)); }
  function handleSkillKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput('');
    }
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const dataUrl = await resizeImage(file, 400);
      set('photo', dataUrl);
    } catch {
      alert('Could not load image. Please try another file.');
    }
    setPhotoLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="form-page">
      <div className="form-header">
        <h2>My Profile</h2>
        <p className="form-subtitle">This info appears on your shared portfolio page.</p>
      </div>

      <form className="project-form" onSubmit={handleSubmit}>

        {/* Photo */}
        <div className="form-group">
          <label>Profile Photo</label>
          <div className="photo-upload-row">
            <div className="photo-preview-wrap">
              {form.photo
                ? <img src={form.photo} alt="Profile" className="photo-preview-img" />
                : <div className="photo-preview-initials">{initials}</div>
              }
            </div>
            <div className="photo-upload-actions">
              <button type="button" className="btn btn-ghost" onClick={() => photoRef.current?.click()} disabled={photoLoading}>
                {photoLoading ? 'Processing...' : form.photo ? 'Change Photo' : 'Upload Photo'}
              </button>
              {form.photo && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => set('photo', '')}>Remove</button>
              )}
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              <p className="photo-hint">JPG, PNG, GIF — resized automatically</p>
            </div>
          </div>
        </div>

        {/* Name + Title */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="form-group">
            <label htmlFor="title">Professional Title</label>
            <input id="title" type="text" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Full-Stack Developer" />
          </div>
        </div>

        {/* Education */}
        <div className="form-group">
          <label>Education</label>
          <div className="edu-list">
            {form.education.map((edu, idx) => (
              <div key={edu.id} className="edu-entry">
                <div className="edu-entry-header">
                  <span className="edu-entry-num">Education #{idx + 1}</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeEdu(edu.id)}>Remove</button>
                </div>
                <div className="form-group">
                  <label>Institution</label>
                  <input type="text" value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} placeholder="University of North Carolina - Wilmington" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Degree</label>
                    <select value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)}>
                      {DEGREES.map(d => <option key={d} value={d}>{d || '— Select degree —'}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input type="text" value={edu.field} onChange={e => updateEdu(edu.id, 'field', e.target.value)} placeholder="Cybersecurity" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="month" value={edu.startDate} onChange={e => updateEdu(edu.id, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{edu.expected ? 'Expected Graduation' : 'Graduation Date'}</label>
                    <input type="month" value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} />
                  </div>
                </div>
                <label className="edu-expected-row">
                  <input type="checkbox" checked={edu.expected || false} onChange={e => updateEdu(edu.id, 'expected', e.target.checked)} />
                  Expected graduation (still enrolled)
                </label>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" style={{ marginTop: '.5rem', alignSelf: 'flex-start' }} onClick={addEdu}>
            + Add Education
          </button>
        </div>

        {/* Work Experience */}
        <div className="form-group">
          <label>Work Experience</label>
          <div className="edu-list">
            {form.experience.map((exp, idx) => (
              <div key={exp.id} className="edu-entry">
                <div className="edu-entry-header">
                  <span className="edu-entry-num">Experience #{idx + 1}</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeExp(exp.id)}>Remove</button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company</label>
                    <input type="text" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} placeholder="Acme Corp" />
                  </div>
                  <div className="form-group">
                    <label>Job Title</label>
                    <input type="text" value={exp.title} onChange={e => updateExp(exp.id, 'title', e.target.value)} placeholder="Software Engineer" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="month" value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{exp.current ? 'Present' : 'End Date'}</label>
                    <input type="month" value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                  </div>
                </div>
                <label className="edu-expected-row">
                  <input type="checkbox" checked={exp.current || false} onChange={e => updateExp(exp.id, 'current', e.target.checked)} />
                  Currently working here
                </label>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={exp.description}
                    onChange={e => updateExp(exp.id, 'description', e.target.value)}
                    placeholder="Describe your role, responsibilities, and accomplishments..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" style={{ marginTop: '.5rem', alignSelf: 'flex-start' }} onClick={addExp}>
            + Add Experience
          </button>
        </div>

        {/* Certifications & Licenses */}
        <div className="form-group">
          <label>Certifications &amp; Licenses</label>
          <div className="edu-list">
            {form.certifications.map((cert, idx) => (
              <div key={cert.id} className="edu-entry">
                <div className="edu-entry-header">
                  <span className="edu-entry-num">Certification #{idx + 1}</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCert(cert.id)}>Remove</button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Certification / License Name</label>
                    <input type="text" value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} placeholder="AWS Certified Solutions Architect" />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input type="text" value={cert.issuer} onChange={e => updateCert(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Issue Date</label>
                    <input type="month" value={cert.issueDate} onChange={e => updateCert(cert.id, 'issueDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{cert.noExpiry ? 'No Expiration' : 'Expiration Date'}</label>
                    <input type="month" value={cert.expiryDate} onChange={e => updateCert(cert.id, 'expiryDate', e.target.value)} disabled={cert.noExpiry} />
                  </div>
                </div>
                <label className="edu-expected-row">
                  <input type="checkbox" checked={cert.noExpiry || false} onChange={e => updateCert(cert.id, 'noExpiry', e.target.checked)} />
                  Does not expire
                </label>
                <div className="form-row">
                  <div className="form-group">
                    <label>Credential ID <span style={{ fontWeight:400, color:'#6b7280' }}>(optional)</span></label>
                    <input type="text" value={cert.credentialId} onChange={e => updateCert(cert.id, 'credentialId', e.target.value)} placeholder="ABC-12345" />
                  </div>
                  <div className="form-group">
                    <label>Credential URL <span style={{ fontWeight:400, color:'#6b7280' }}>(optional)</span></label>
                    <input type="url" value={cert.url} onChange={e => updateCert(cert.id, 'url', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" style={{ marginTop: '.5rem', alignSelf: 'flex-start' }} onClick={addCert}>
            + Add Certification
          </button>
        </div>

        {/* Skills */}
        <div className="form-group">
          <label>Skills</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem', marginBottom:'.5rem' }}>
            {form.skills.map(skill => (
              <span key={skill} style={{ display:'inline-flex', alignItems:'center', gap:'.3rem', background:'#1e1b4b', color:'#a5b4fc', border:'1px solid #3730a3', borderRadius:99, padding:'.25rem .75rem', fontSize:'.82rem', fontWeight:500 }}>
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontSize:'.9rem', lineHeight:1, padding:0 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display:'flex', gap:'.5rem' }}>
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKey}
              placeholder="Type a skill and press Enter (e.g. Python, React, AWS)"
              style={{ flex:1 }}
            />
            <button type="button" className="btn btn-ghost" onClick={() => { addSkill(skillInput); setSkillInput(''); }}>Add</button>
          </div>
          <p style={{ fontSize:'.78rem', color:'#6b7280', marginTop:'.35rem' }}>Press Enter or comma to add each skill.</p>
        </div>

        {/* Resume URL */}
        <div className="form-group">
          <label htmlFor="resumeUrl">Resume Link</label>
          <input
            id="resumeUrl"
            type="url"
            value={form.resumeUrl || ''}
            onChange={e => set('resumeUrl', e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
          />
          <p style={{ fontSize:'.78rem', color:'#6b7280', marginTop:'.35rem' }}>
            Paste a link to your resume — Google Drive, Dropbox, OneDrive, or any public PDF URL. Interviewers will see it in a viewer tab and can download it.
          </p>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label htmlFor="bio">Bio / About Me</label>
          <textarea id="bio" value={form.bio || ''} onChange={e => set('bio', e.target.value)}
            placeholder="A short intro about yourself..." rows={3} />
        </div>

        {/* Links */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="github">GitHub URL</label>
            <input id="github" type="url" value={form.github || ''} onChange={e => set('github', e.target.value)} placeholder="https://github.com/username" />
          </div>
          <div className="form-group">
            <label htmlFor="linkedin">LinkedIn URL</label>
            <input id="linkedin" type="url" value={form.linkedin || ''} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Contact Email</label>
          <input id="email" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{saved ? 'Saved!' : 'Save Profile'}</button>
        </div>
      </form>
    </div>
  );
}

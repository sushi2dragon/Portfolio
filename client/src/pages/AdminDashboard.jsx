import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import TagInput from '../components/TagInput/TagInput'
import './Admin.css'

/* ── helpers ────────────────────────────────────────────── */
const EMPTY_PROJECT = {
  title: '',
  description: '',
  longDescription: '',
  tags: [],
  github: '',
  liveUrl: '',
  screenshots: [],
  isProprietaryWork: false,
  category: 'personal',
  status: 'completed',
}

const EMPTY_CERT = {
  name: '',
  issuer: '',
  issuerDomain: '',
  issuerLogo: '',
  date: '',
  credentialUrl: '',
}

const EMPTY_SITE = {
  name: '',
  greeting: '',
  subtitle: '',
  portrait: '',
  resumeUrl: '/resume.pdf',
  resumePreview: '',
  about: { bio: '', currentProject: '', currentProjectId: null, skills: [] },
  social: { github: '', linkedin: '', whatsapp: '', email: '' },
}

/* ── ScreenshotManager ──────────────────────────────────── */
function ScreenshotManager({ value = [], onChange, token }) {
  const [urlInput, setUrlInput] = useState('')
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const addUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setUrlInput('')
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const { url } = await res.json()
      onChange([...value, url])
    } catch {/* ignore */}
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="screenshot-manager">
      <div className="screenshot-manager__add">
        <input
          className="form-input screenshot-manager__url"
          placeholder="Paste screenshot URL…"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={addUrl}>Add</button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '⬆ Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {value.length > 0 && (
        <div className="screenshot-manager__thumbs">
          {value.map((src, i) => (
            <div key={i} className="screenshot-thumb">
              <img src={src} alt={`screenshot ${i + 1}`} className="screenshot-thumb__img" />
              <button
                type="button"
                className="screenshot-thumb__remove"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remove screenshot"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── PortraitUploader ───────────────────────────────────── */
function PortraitUploader({ value, onChange, token }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const { url } = await res.json()
      onChange(url)
    } catch {/* ignore */}
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="portrait-uploader">
      {value && (
        <div className="portrait-uploader__preview">
          <img src={value} alt="Resume preview" className="portrait-uploader__img" />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onChange('')}
          >Remove</button>
        </div>
      )}
      <div className="portrait-uploader__actions">
        <input
          className="form-input"
          placeholder="Or paste image URL…"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '⬆ Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  )
}

function ResumeUploader({ value, onChange, token }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('resume', file)
    try {
      const res = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (res.ok && data.url) onChange(data.url)
    } catch {/* ignore */}
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="portrait-uploader">
      <div className="portrait-uploader__actions">
        <input
          className="form-input"
          placeholder="Resume PDF URL..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  )
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('projects') // 'projects' | 'settings' | 'certs'

  // ── Projects state ──
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [editId, setEditId] = useState(null)
  const [projectLoading, setProjectLoading] = useState(false)

  // ── Site settings state ──
  const [siteForm, setSiteForm] = useState(EMPTY_SITE)
  const [siteLoading, setSiteLoading] = useState(false)

  // ── Certifications state ──
  const [certs, setCerts] = useState([])
  const [showCertForm, setShowCertForm] = useState(false)
  const [certForm, setCertForm] = useState(EMPTY_CERT)
  const [editCertId, setEditCertId] = useState(null)
  const [certLoading, setCertLoading] = useState(false)

  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) { navigate('/admin'); return }
    // Load projects
    fetch('/api/projects').then(r => r.json()).then(setProjects)
    // Load certifications
    fetch('/api/certifications').then(r => r.json()).then(setCerts).catch(() => {})
    // Load site settings
    fetch('/api/site').then(r => r.json()).then(data => {
      setSiteForm({
        name: data.name || '',
        greeting: data.greeting || '',
        subtitle: data.subtitle || '',
        portrait: data.portrait || '',
        resumeUrl: data.resumeUrl || '/resume.pdf',
        resumePreview: data.resumePreview || '',
        about: {
          bio: data.about?.bio || '',
          currentProject: data.about?.currentProject || '',
          currentProjectId: data.about?.currentProjectId || null,
          skills: data.about?.skills || [],
        },
        social: {
          github: data.social?.github || '',
          linkedin: data.social?.linkedin || '',
          whatsapp: data.social?.whatsapp || '',
          email: data.social?.email || '',
        },
      })
    })
  }, [])

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  /* ── Project handlers ── */
  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  const setCheck = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.checked }))

  const handleNewProject = () => {
    setForm(EMPTY_PROJECT)
    setEditId(null)
    setShowForm(true)
    setTimeout(() => document.querySelector('.admin-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleEdit = (p) => {
    setEditId(p.id)
    setForm({
      title: p.title || '',
      description: p.description || '',
      longDescription: p.longDescription || '',
      tags: p.tags || [],
      github: p.github || '',
      liveUrl: p.liveUrl || '',
      screenshots: p.screenshots || [],
      isProprietaryWork: p.isProprietaryWork || false,
      category: p.category || 'personal',
      status: p.status || 'completed',
    })
    setShowForm(true)
    setTimeout(() => document.querySelector('.admin-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_PROJECT)
  }

  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    setProjectLoading(true)
    const body = { ...form }
    const url = editId ? `/api/projects/${editId}` : '/api/projects'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) })
    if (res.status === 401) { navigate('/admin'); return }
    const saved = await res.json()
    if (editId) {
      setProjects(ps => ps.map(p => p.id === editId ? saved : p))
      showMsg('Project updated.')
    } else {
      setProjects(ps => [saved, ...ps])
      showMsg('Project added.')
    }
    handleCancelForm()
    setProjectLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: authHeaders })
    if (res.status === 401) { navigate('/admin'); return }
    setProjects(ps => ps.filter(p => p.id !== id))
    showMsg('Deleted.')
  }

  /* ── Site settings handlers ── */
  const setSiteField = (key) => (e) =>
    setSiteForm(f => ({ ...f, [key]: e.target.value }))
  const setSiteAbout = (key) => (val) =>
    setSiteForm(f => ({ ...f, about: { ...f.about, [key]: val } }))
  const setSiteAboutField = (key) => (e) =>
    setSiteForm(f => ({ ...f, about: { ...f.about, [key]: e.target.value } }))
  const setSiteSocial = (key) => (e) =>
    setSiteForm(f => ({ ...f, social: { ...f.social, [key]: e.target.value } }))

  const handleSiteSubmit = async (e) => {
    e.preventDefault()
    setSiteLoading(true)
    const res = await fetch('/api/site', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(siteForm),
    })
    if (res.status === 401) { navigate('/admin'); return }
    showMsg('Site settings saved.')
    setSiteLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  /* ── Cert handlers ── */
  const setCertField = (key) => (e) => setCertForm(f => ({ ...f, [key]: e.target.value }))

  const handleNewCert = () => {
    setCertForm(EMPTY_CERT)
    setEditCertId(null)
    setShowCertForm(true)
  }

  const handleEditCert = (c) => {
    setEditCertId(c.id)
    setCertForm({
      name: c.name || '',
      issuer: c.issuer || '',
      issuerDomain: c.issuerDomain || '',
      issuerLogo: c.issuerLogo || '',
      date: c.date || '',
      credentialUrl: c.credentialUrl || '',
    })
    setShowCertForm(true)
  }

  const handleCertSubmit = async (e) => {
    e.preventDefault()
    setCertLoading(true)
    const url = editCertId ? `/api/certifications/${editCertId}` : '/api/certifications'
    const method = editCertId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(certForm) })
    if (res.status === 401) { navigate('/admin'); return }
    const saved = await res.json()
    if (editCertId) {
      setCerts(cs => cs.map(c => c.id === editCertId ? saved : c))
      showMsg('Certification updated.')
    } else {
      setCerts(cs => [...cs, saved])
      showMsg('Certification added.')
    }
    setShowCertForm(false)
    setEditCertId(null)
    setCertForm(EMPTY_CERT)
    setCertLoading(false)
  }

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete this certification?')) return
    const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE', headers: authHeaders })
    if (res.status === 401) { navigate('/admin'); return }
    setCerts(cs => cs.filter(c => c.id !== id))
    showMsg('Deleted.')
  }

  /* ── Render ── */
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="sketch admin-header__title">Dashboard</h1>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>

      {msg && <div className="admin-msg">{msg}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'projects' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('projects')}
        >Projects</button>
        <button
          className={`admin-tab ${tab === 'settings' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('settings')}
        >Site Settings</button>
        <button
          className={`admin-tab ${tab === 'certs' ? 'admin-tab--active' : ''}`}
          onClick={() => setTab('certs')}
        >Certifications</button>
      </div>

      {/* ── PROJECTS TAB ── */}
      {tab === 'projects' && (
        <div className="admin-body">
          {/* Project list */}
          <section className="admin-list-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Projects ({projects.length})</h2>
              {!showForm && (
                <button className="btn btn-primary btn-sm" onClick={handleNewProject}>
                  + New Project
                </button>
              )}
            </div>

            <div className="admin-project-list">
              {projects.map(p => (
                <div key={p.id} className="admin-project-row">
                  <div className="admin-project-info">
                    <span className="admin-project-title">
                      {p.title}
                      {p.isProprietaryWork && <span className="admin-proprietary-badge">🔒 proprietary</span>}
                    </span>
                    <div className="admin-project-tags">
                      {(p.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="admin-project-btns">
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="admin-empty mono">No projects yet.</p>}
            </div>
          </section>

          {/* Add / Edit form — hidden until triggered */}
          {showForm && (
            <section className="admin-form-section">
              <h2 className="admin-section-title">{editId ? 'Edit Project' : 'New Project'}</h2>
              <form onSubmit={handleProjectSubmit} className="admin-form">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={setField('title')}
                    required
                    placeholder="Project name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description *</label>
                  <textarea
                    className="form-input form-textarea"
                    value={form.description}
                    onChange={setField('description')}
                    required
                    placeholder="One or two sentences shown on the project card…"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Case Study{' '}
                    <span className="form-hint">(full write-up on the project page — blank line between paragraphs)</span>
                  </label>
                  <textarea
                    className="form-input form-textarea form-textarea--tall"
                    value={form.longDescription}
                    onChange={setField('longDescription')}
                    placeholder={"Paragraph 1: What the project is and why you built it.\n\nParagraph 2: Key technical challenges and how you solved them.\n\nParagraph 3: Results, learnings, or what you'd do differently."}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Technologies</label>
                  <TagInput
                    value={form.tags}
                    onChange={(tags) => setForm(f => ({ ...f, tags }))}
                    placeholder="Add tech tags…"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={setField('category')}>
                      <option value="personal">Personal</option>
                      <option value="academic">Academic</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={setField('status')}>
                      <option value="completed">Completed</option>
                      <option value="in-development">In Development</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input
                      className="form-input"
                      value={form.github}
                      onChange={setField('github')}
                      placeholder="https://github.com/…"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Live URL</label>
                    <input
                      className="form-input"
                      value={form.liveUrl}
                      onChange={setField('liveUrl')}
                      placeholder="https://…"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Screenshots</label>
                  <ScreenshotManager
                    value={form.screenshots}
                    onChange={(screenshots) => setForm(f => ({ ...f, screenshots }))}
                    token={token}
                  />
                </div>

                <div className="form-group form-group--checkbox">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.isProprietaryWork}
                      onChange={setCheck('isProprietaryWork')}
                      className="form-checkbox"
                    />
                    Proprietary work — hide GitHub link and show lock badge
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="btn btn-outline" onClick={handleCancelForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={projectLoading}>
                    {projectLoading ? 'Saving…' : editId ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}

      {/* ── SITE SETTINGS TAB ── */}
      {tab === 'settings' && (
        <form onSubmit={handleSiteSubmit} className="admin-body">

            {/* Personal Info */}
            <section className="admin-form-section">
              <h2 className="admin-section-title">Personal Info</h2>
              <div className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      className="form-input"
                      value={siteForm.name}
                      onChange={setSiteField('name')}
                      placeholder="Sarthak"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Greeting Line</label>
                    <input
                      className="form-input"
                      value={siteForm.greeting}
                      onChange={setSiteField('greeting')}
                      placeholder="Hi, my name is"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Subtitle</label>
                  <textarea
                    className="form-input form-textarea"
                    value={siteForm.subtitle}
                    onChange={setSiteField('subtitle')}
                    placeholder="Short description shown in the hero section…"
                  />
                </div>
              </div>
            </section>

            {/* Resume */}
            <section className="admin-form-section">
              <h2 className="admin-section-title">Resume Card</h2>
              <div className="admin-form">
                <div className="form-group">
                  <label className="form-label">Resume Preview Image</label>
                  <PortraitUploader
                    value={siteForm.resumePreview}
                    onChange={(url) => setSiteForm(f => ({ ...f, resumePreview: url }))}
                    token={token}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume PDF</label>
                  <ResumeUploader
                    value={siteForm.resumeUrl}
                    onChange={(url) => setSiteForm(f => ({ ...f, resumeUrl: url }))}
                    token={token}
                  />
                  <p className="form-hint">Uploads are stored on the server and linked automatically. If the browser does not render the PDF preview cleanly, upload a PNG/JPG of page 1 above.</p>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="admin-form-section">
              <h2 className="admin-section-title">About Section</h2>
              <div className="admin-form">
                <div className="form-group">
                  <label className="form-label">
                    Bio <span className="form-hint">(separate paragraphs with a blank line)</span>
                  </label>
                  <textarea
                    className="form-input form-textarea form-textarea--tall"
                    value={siteForm.about.bio}
                    onChange={setSiteAboutField('bio')}
                    placeholder="Tell visitors about yourself…"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Currently Building</label>
                  <select
                    className="form-input"
                    value={siteForm.about.currentProjectId || ''}
                    onChange={e => {
                      const id = e.target.value || null
                      const proj = projects.find(p => String(p.id) === String(id))
                      setSiteForm(f => ({
                        ...f,
                        about: {
                          ...f.about,
                          currentProjectId: id,
                          currentProject: proj ? proj.title : '',
                        }
                      }))
                    }}
                  >
                    <option value="">— None —</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Skills / Technologies</label>
                  <TagInput
                    value={siteForm.about.skills}
                    onChange={setSiteAbout('skills')}
                    placeholder="Add skills…"
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="admin-form-section">
              <h2 className="admin-section-title">Social Links</h2>
              <div className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input
                      className="form-input"
                      value={siteForm.social.github}
                      onChange={setSiteSocial('github')}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input
                      className="form-input"
                      value={siteForm.social.linkedin}
                      onChange={setSiteSocial('linkedin')}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input
                      className="form-input"
                      value={siteForm.social.whatsapp}
                      onChange={setSiteSocial('whatsapp')}
                      placeholder="https://wa.me/1234567890"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      value={siteForm.social.email}
                      onChange={setSiteSocial('email')}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="admin-settings-save">
              <button type="submit" className="btn btn-primary" disabled={siteLoading}>
                {siteLoading ? 'Saving…' : 'Save All Settings'}
              </button>
            </div>
          </form>
      )}

      {/* ── CERTIFICATIONS TAB ── */}
      {tab === 'certs' && (
        <div className="admin-body">
          <section className="admin-list-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Certifications ({certs.length})</h2>
              {!showCertForm && (
                <button className="btn btn-primary btn-sm" onClick={handleNewCert}>
                  + Add Certification
                </button>
              )}
            </div>

            <div className="admin-project-list">
              {certs.map(c => (
                <div key={c.id} className="admin-project-row">
                  <div className="admin-project-info">
                    <span className="admin-project-title">{c.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {c.issuer}{c.date ? ` · ${c.date}` : ''}
                    </span>
                  </div>
                  <div className="admin-project-btns">
                    <button className="btn btn-outline btn-sm" onClick={() => handleEditCert(c)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCert(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {certs.length === 0 && <p className="admin-empty mono">No certifications yet.</p>}
            </div>
          </section>

          {showCertForm && (
            <section className="admin-form-section">
              <h2 className="admin-section-title">{editCertId ? 'Edit Certification' : 'New Certification'}</h2>
              <form onSubmit={handleCertSubmit} className="admin-form">
                <div className="form-group">
                  <label className="form-label">Certification Name *</label>
                  <input
                    className="form-input"
                    value={certForm.name}
                    onChange={setCertField('name')}
                    required
                    placeholder="Machine Learning Specialization"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Issuer *</label>
                    <input
                      className="form-input"
                      value={certForm.issuer}
                      onChange={setCertField('issuer')}
                      required
                      placeholder="Coursera, IBM, MathWorks…"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Issuer Domain <span className="form-hint">(for auto logo)</span>
                    </label>
                    <input
                      className="form-input"
                      value={certForm.issuerDomain}
                      onChange={setCertField('issuerDomain')}
                      placeholder="coursera.org"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Date <span className="form-hint">(YYYY-MM)</span>
                    </label>
                    <input
                      className="form-input"
                      value={certForm.date}
                      onChange={setCertField('date')}
                      placeholder="2024-03"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credential URL</label>
                    <input
                      className="form-input"
                      value={certForm.credentialUrl}
                      onChange={setCertField('credentialUrl')}
                      placeholder="https://coursera.org/verify/…"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Logo URL <span className="form-hint">(optional override — leave blank to use issuer domain favicon)</span>
                  </label>
                  <input
                    className="form-input"
                    value={certForm.issuerLogo}
                    onChange={setCertField('issuerLogo')}
                    placeholder="https://…/logo.png"
                  />
                </div>

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setShowCertForm(false); setEditCertId(null); setCertForm(EMPTY_CERT) }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={certLoading}>
                    {certLoading ? 'Saving…' : editCertId ? 'Update' : 'Add Certification'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

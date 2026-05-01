import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './ProjectDetail.css'

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const EXTERNAL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const BACK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const LOCK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    fetch(`/api/projects/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => {
        if (data) { setProject(data); setLoading(false) }
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="project-detail project-detail--state">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="project-detail project-detail--state">
        <p className="sketch" style={{ fontSize: '1.8rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
          Project not found.
        </p>
        <Link to="/#projects" className="btn btn-outline">{BACK_ICON} Back to projects</Link>
      </div>
    )
  }

  const { title, description, longDescription, tags = [], github, liveUrl, screenshots = [], createdAt, isProprietaryWork } = project
  const heroImg = screenshots[activeImg] ?? screenshots[0] ?? null
  const paragraphs = longDescription ? longDescription.split(/\n\n+/).filter(Boolean) : []

  return (
    <div className="project-detail">
      <div className="container">

        <Link to="/#projects" className="project-detail__back">
          {BACK_ICON} All projects
        </Link>

        <div className="project-detail__header">
          <div className="project-detail__header-left">
            <p className="section-label">case study</p>
            <h1 className="project-detail__title">{title}</h1>
            <p className="project-detail__subtitle">{description}</p>
            <div className="project-detail__header-tags">
              {tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div className="project-detail__header-right">
            {isProprietaryWork && (
              <span className="project-detail__proprietary-badge">
                {LOCK_ICON} Proprietary
              </span>
            )}
            {!isProprietaryWork && github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                {GITHUB_ICON} Source
              </a>
            )}
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {EXTERNAL_ICON} Live demo
              </a>
            )}
          </div>
        </div>

        {heroImg && (
          <div className="project-detail__hero">
            <img src={heroImg} alt={`${title} screenshot`} />
          </div>
        )}

        <div className="project-detail__body">
          <main className="project-detail__content">
            {paragraphs.length > 0 ? (
              <div className="project-detail__long-desc">
                {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            ) : (
              <div className="project-detail__long-desc project-detail__long-desc--empty">
                <p className="sketch">No case study written yet.</p>
              </div>
            )}

            {screenshots.length > 1 && (
              <div className="project-detail__gallery">
                <h3 className="gallery__heading">Screenshots</h3>
                <div className="gallery__grid">
                  {screenshots.map((src, i) => (
                    <button
                      key={i}
                      className={`gallery__thumb ${activeImg === i ? 'gallery__thumb--active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Screenshot ${i + 1}`}
                    >
                      <img src={src} alt={`${title} screenshot ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="project-detail__sidebar">
            <div className="sidebar-block">
              <h4 className="sidebar-block__heading">About</h4>
              {isProprietaryWork && (
                <div className="sidebar-proprietary">
                  {LOCK_ICON}
                  <span>Proprietary — source not public</span>
                </div>
              )}
              {createdAt && (
                <p className="sidebar-meta">
                  Built {new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              )}
            </div>

            <div className="sidebar-block">
              <h4 className="sidebar-block__heading">Tech Stack</h4>
              <div className="sidebar-tags">
                {tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>

            {((!isProprietaryWork && github) || liveUrl) && (
              <div className="sidebar-block">
                <h4 className="sidebar-block__heading">Links</h4>
                <div className="sidebar-links">
                  {!isProprietaryWork && github && (
                    <a href={github} target="_blank" rel="noopener noreferrer" className="sidebar-link">
                      {GITHUB_ICON} View source
                    </a>
                  )}
                  {liveUrl && (
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="sidebar-link">
                      {EXTERNAL_ICON} Live demo
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>

      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE, resolveUrl } from '../config'
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

const PLAY_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
    <circle cx="12" cy="12" r="12" fillOpacity="0.55" />
    <polygon points="10,8 18,12 10,16" fill="white" />
  </svg>
)

const PDF_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)

const CHEVRON_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const CHEVRON_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

function getMediaType(url = '') {
  const u = url.toLowerCase().split('?')[0]
  if (/youtube\.com|youtu\.be/.test(u)) return 'youtube'
  if (/vimeo\.com/.test(u)) return 'vimeo'
  if (/\.(mp4|webm|ogg|mov)$/.test(u)) return 'video'
  if (/\.pdf$/.test(u)) return 'pdf'
  return 'image'
}

function toEmbedUrl(url, autoplay = false) {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}${autoplay ? '?autoplay=1' : ''}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}${autoplay ? '?autoplay=1' : ''}`
  return url
}

function HeroMedia({ src, title, onClick }) {
  const type = getMediaType(src)
  if (type === 'image') {
    return (
      <img
        src={src}
        alt={`${title} screenshot`}
        className="hero-media hero-media--img"
        onClick={onClick}
        title="Click to expand"
      />
    )
  }
  if (type === 'video') {
    return <video src={src} controls className="hero-media hero-media--video" />
  }
  if (type === 'youtube' || type === 'vimeo') {
    return (
      <iframe
        src={toEmbedUrl(src)}
        className="hero-media hero-media--iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title}
      />
    )
  }
  if (type === 'pdf') {
    return <iframe src={src} className="hero-media hero-media--iframe hero-media--pdf" title={title} />
  }
  return <img src={src} alt={`${title} screenshot`} className="hero-media hero-media--img" onClick={onClick} />
}

function GalleryThumb({ src, active, index, onClick }) {
  const type = getMediaType(src)
  return (
    <button
      className={`gallery__thumb ${active ? 'gallery__thumb--active' : ''}`}
      onClick={() => onClick(index)}
      aria-label={`Gallery item ${index + 1}`}
    >
      {type === 'image' ? (
        <img src={src} alt={`gallery ${index + 1}`} />
      ) : type === 'pdf' ? (
        <div className="gallery__thumb-placeholder">
          {PDF_ICON}
          <span className="gallery__thumb-label mono">PDF</span>
        </div>
      ) : (
        <div className="gallery__thumb-placeholder">
          {PLAY_ICON}
          <span className="gallery__thumb-label mono">
            {type === 'youtube' ? 'YouTube' : type === 'vimeo' ? 'Vimeo' : 'Video'}
          </span>
        </div>
      )}
    </button>
  )
}

function Lightbox({ items, idx, onClose, onPrev, onNext }) {
  const src = items[idx]
  const type = getMediaType(src)
  const multi = items.length > 1

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && multi) onPrev()
      if (e.key === 'ArrowRight' && multi) onNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext, multi])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lightbox__close" onClick={onClose} aria-label="Close">✕</button>

      {multi && (
        <>
          <button className="lightbox__arrow lightbox__arrow--prev" onClick={e => { e.stopPropagation(); onPrev() }} aria-label="Previous">
            {CHEVRON_LEFT}
          </button>
          <button className="lightbox__arrow lightbox__arrow--next" onClick={e => { e.stopPropagation(); onNext() }} aria-label="Next">
            {CHEVRON_RIGHT}
          </button>
        </>
      )}

      <div className="lightbox__content" onClick={e => e.stopPropagation()}>
        {type === 'image' && (
          <img src={src} alt={`gallery item ${idx + 1}`} className="lightbox__img" />
        )}
        {type === 'video' && (
          <video src={src} controls autoPlay className="lightbox__video" />
        )}
        {(type === 'youtube' || type === 'vimeo') && (
          <iframe
            src={toEmbedUrl(src, true)}
            className="lightbox__iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`gallery item ${idx + 1}`}
          />
        )}
        {type === 'pdf' && (
          <iframe src={src} className="lightbox__iframe lightbox__iframe--pdf" title={`gallery item ${idx + 1}`} />
        )}
      </div>

      {multi && (
        <div className="lightbox__counter mono">
          {idx + 1} / {items.length}
        </div>
      )}
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    fetch(`${API_BASE}/api/projects/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setProject({ ...data, screenshots: (data.screenshots || []).map(resolveUrl) })
          setLoading(false)
        }
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  const openLightbox = useCallback((idx) => {
    setLightboxIdx(idx)
    setLightboxOpen(true)
  }, [])
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const prevItem = useCallback(() => setLightboxIdx(i => (i - 1 + (project?.screenshots?.length || 1)) % (project?.screenshots?.length || 1)), [project])
  const nextItem = useCallback(() => setLightboxIdx(i => (i + 1) % (project?.screenshots?.length || 1)), [project])

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

  const { title, description, longDescription, tags = [], github, liveUrl, screenshots = [], projectDate, createdAt, isProprietaryWork } = project
  const heroSrc = screenshots[activeImg] ?? screenshots[0] ?? null
  const heroType = heroSrc ? getMediaType(heroSrc) : null
  const paragraphs = longDescription ? longDescription.split(/\n\n+/).filter(Boolean) : []

  return (
    <>
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

          {heroSrc && (
            <div
              className={`project-detail__hero${heroType === 'image' ? ' project-detail__hero--clickable' : ''}`}
              onClick={heroType === 'image' ? () => openLightbox(activeImg) : undefined}
            >
              <HeroMedia src={heroSrc} title={title} onClick={heroType === 'image' ? () => openLightbox(activeImg) : undefined} />
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

              {screenshots.length > 0 && (
                <div className="project-detail__gallery">
                  <h3 className="gallery__heading">Gallery</h3>
                  <div className="gallery__grid">
                    {screenshots.map((src, i) => (
                      <GalleryThumb
                        key={i}
                        src={src}
                        active={activeImg === i}
                        index={i}
                        onClick={(idx) => { setActiveImg(idx); openLightbox(idx) }}
                      />
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
                {(projectDate || createdAt) && (
                  <p className="sidebar-meta">
                    {projectDate
                      ? `Built ${new Date(projectDate + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                      : `Built ${new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`
                    }
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

      {lightboxOpen && screenshots.length > 0 && (
        <Lightbox
          items={screenshots}
          idx={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSite } from '../../context/SiteContext'
import { API_BASE, resolveUrl } from '../../config'
import './About.css'

const isImage = url => url && !/\.(mp4|webm|ogg|mov|pdf)$/i.test(url)

export default function About() {
  const { site } = useSite()
  const { about } = site
  const navigate = useNavigate()
  const hasLink = !!about.currentProjectId
  const bioParagraphs = (about.bio || '').split(/\n\n+/).filter(Boolean)

  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (!about.currentProjectId) { setPreviewUrl(null); return }
    let cancelled = false
    fetch(`${API_BASE}/api/projects/${about.currentProjectId}`)
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        if (cancelled || !p) return
        const shots = (p.screenshots || []).map(resolveUrl)
        const firstImg = shots.find(isImage)
        setPreviewUrl(firstImg || null)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [about.currentProjectId])

  return (
    <section className="about section" id="about">
      <div className="container about__inner">
        <div className="about__text">
          <p className="section-label">01. about</p>
          <h2 className="section-title">A bit <span>about me</span></h2>

          <div className="about__bio">
            {bioParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="about__skills">
            <p className="about__skills-label mono">Technologies I use:</p>
            <ul className="about__skills-list">
              {(about.skills || []).map(s => (
                <li key={s}>
                  <span className="about__skill-bullet mono">▹</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="about__visual">
          <div
            className={`about__card${hasLink ? ' about__card--link' : ''}${previewUrl ? ' about__card--has-preview' : ''}`}
            onClick={hasLink ? () => navigate(`/projects/${about.currentProjectId}`) : undefined}
            role={hasLink ? 'button' : undefined}
            tabIndex={hasLink ? 0 : undefined}
            onKeyDown={hasLink ? e => (e.key === 'Enter' || e.key === ' ') && navigate(`/projects/${about.currentProjectId}`) : undefined}
            aria-label={hasLink ? `View ${about.currentProject}` : undefined}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt={about.currentProject || 'Current project preview'}
                className="about__card-preview"
                aria-hidden="true"
              />
            )}

            <div className="about__card-veil" aria-hidden="true" />

            <svg
              className="about__card-border"
              viewBox="0 0 340 220"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect x="14" y="14" width="312" height="192" rx="3" ry="3" />
            </svg>

            <div className="about__card-inner">
              <span className="sketch about__card-label">currently building</span>
              <p className="about__card-project">{about.currentProject || 'Something cool ✦'}</p>
              {hasLink && <span className="about__card-arrow">→</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

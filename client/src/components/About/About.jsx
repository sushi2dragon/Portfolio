import { useNavigate } from 'react-router-dom'
import { useSite } from '../../context/SiteContext'
import './About.css'

export default function About() {
  const { site } = useSite()
  const { about } = site
  const navigate = useNavigate()
  const hasLink = !!about.currentProjectId
  const bioParagraphs = (about.bio || '').split(/\n\n+/).filter(Boolean)

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
            className={`about__card${hasLink ? ' about__card--link' : ''}`}
            onClick={hasLink ? () => navigate(`/projects/${about.currentProjectId}`) : undefined}
            role={hasLink ? 'button' : undefined}
            tabIndex={hasLink ? 0 : undefined}
            onKeyDown={hasLink ? e => (e.key === 'Enter' || e.key === ' ') && navigate(`/projects/${about.currentProjectId}`) : undefined}
            aria-label={hasLink ? `View ${about.currentProject}` : undefined}
          >
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

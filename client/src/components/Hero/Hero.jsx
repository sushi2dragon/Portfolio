import { useSite } from '../../context/SiteContext'
import './Hero.css'

const RESUME_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="14" y2="17" />
  </svg>
)

function ResumeDocMockup({ name }) {
  return (
    <div className="resume-doc">
      <div className="resume-doc__header">
        <div className="resume-doc__name">{name || 'Sarthak Dravid'}</div>
        <div className="resume-doc__tagline">Developer · Student · Builder</div>
        <div className="resume-doc__contacts">
          <span>GitHub</span><span>·</span><span>LinkedIn</span><span>·</span><span>Email</span>
        </div>
      </div>

      <div className="resume-doc__divider" />

      <div className="resume-doc__section">
        <div className="resume-doc__section-label">Experience</div>
        <div className="resume-doc__entry">
          <span className="resume-doc__entry-title" style={{ width: '70%' }} />
          <span className="resume-doc__entry-sub" style={{ width: '45%' }} />
          <span className="resume-doc__line" style={{ width: '92%' }} />
          <span className="resume-doc__line" style={{ width: '78%' }} />
        </div>
        <div className="resume-doc__entry">
          <span className="resume-doc__entry-title" style={{ width: '60%' }} />
          <span className="resume-doc__entry-sub" style={{ width: '40%' }} />
          <span className="resume-doc__line" style={{ width: '88%' }} />
          <span className="resume-doc__line" style={{ width: '65%' }} />
        </div>
      </div>

      <div className="resume-doc__divider resume-doc__divider--light" />

      <div className="resume-doc__section">
        <div className="resume-doc__section-label">Education</div>
        <div className="resume-doc__entry">
          <span className="resume-doc__entry-title" style={{ width: '75%' }} />
          <span className="resume-doc__entry-sub" style={{ width: '50%' }} />
          <span className="resume-doc__line" style={{ width: '82%' }} />
        </div>
      </div>

      <div className="resume-doc__divider resume-doc__divider--light" />

      <div className="resume-doc__section">
        <div className="resume-doc__section-label">Skills</div>
        <div className="resume-doc__skills">
          <span>Python</span>
          <span>React</span>
          <span>Unity</span>
          <span>OpenCV</span>
          <span>Three.js</span>
          <span>PyTorch</span>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { site } = useSite()
  const { name, subtitle, resumeUrl, social } = site
  const resumeHref = resumeUrl || '/resume.pdf'

  return (
    <section className="hero" id="home">
      <div className="hero__content container">
        <div className="hero__text">
          <p className="hero__greeting">{site.greeting}</p>
          <h1 className="hero__name">{name}.</h1>
          <p className="hero__subtitle">{subtitle}</p>

          <div className="hero__actions">
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="#contact" className="btn btn-outline">Get in Touch</a>
          </div>
        </div>

        <div className="hero__resume">
          <a
            href={resumeHref}
            download="Sarthak_Dravid_CV.pdf"
            className="resume-card"
            aria-label="Download resume"
          >
            <div className="resume-card__preview" aria-hidden="true">
              <ResumeDocMockup name={name} />
              <div className="resume-card__preview-overlay" />
            </div>

            <div className="resume-card__veil" aria-hidden="true" />

            <svg
              className="resume-card__border"
              viewBox="0 0 320 380"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect x="14" y="14" width="292" height="352" rx="3" ry="3" />
            </svg>

            <div className="resume-card__content">
              <p className="resume-card__eyebrow mono">Download</p>
              <h2 className="resume-card__title">Resume</h2>
            </div>
          </a>
        </div>
      </div>

      <div className="hero__scroll-hint">
        <span className="mono">scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}

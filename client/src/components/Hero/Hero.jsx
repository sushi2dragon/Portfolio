import { useSite } from '../../context/SiteContext'
import './Hero.css'

function getDriveFileId(url) {
  if (!url) return null
  const m = url.match(/\/file\/d\/([^/?#]+)/) || url.match(/[?&]id=([^&]+)/)
  return m ? m[1] : null
}

function getThumbUrl(url) {
  if (!url) return null
  const driveId = getDriveFileId(url)
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w640-h900`
  if (url.includes('cloudinary.com')) return url.replace('/upload/', '/upload/f_jpg,pg_1,w_640,q_auto/')
  return null
}

function getDownloadUrl(url) {
  if (!url) return '/resume.pdf'
  const driveId = getDriveFileId(url)
  if (driveId) return `https://drive.google.com/uc?export=download&id=${driveId}`
  if (url.includes('cloudinary.com')) return url.replace('/upload/', '/upload/fl_attachment/')
  return url
}

function ResumeDocMockup() {
  return (
    <div className="resume-doc">
      <div className="resume-doc__header">
        <div className="resume-doc__name">Sarthak Dravid</div>
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
          <span>Python</span><span>React</span><span>Unity</span>
          <span>OpenCV</span><span>Three.js</span><span>PyTorch</span>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { site } = useSite()
  const { name, subtitle, resumeUrl } = site

  const thumbUrl    = getThumbUrl(resumeUrl)
  const downloadUrl = getDownloadUrl(resumeUrl)

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
            href={downloadUrl}
            download="Sarthak_Dravid_CV.pdf"
            className="resume-card"
            aria-label="Download resume"
          >
            <div className="resume-card__preview" aria-hidden="true">
              {thumbUrl
                ? <img src={thumbUrl} alt="Resume preview" className="resume-card__preview-image" />
                : <ResumeDocMockup />
              }
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

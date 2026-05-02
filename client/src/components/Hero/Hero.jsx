import { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { useSite } from '../../context/SiteContext'
import './Hero.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

function PDFPreview({ src }) {
  const [imgSrc, setImgSrc] = useState(null)

  useEffect(() => {
    if (!src || !src.endsWith('.pdf')) return
    let cancelled = false
    async function render() {
      const pdf = await pdfjsLib.getDocument(src).promise
      if (cancelled) return
      const page = await pdf.getPage(1)
      if (cancelled) return
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      if (cancelled) return
      setImgSrc(canvas.toDataURL('image/jpeg', 0.9))
    }
    render().catch(() => {})
    return () => { cancelled = true }
  }, [src])

  if (!imgSrc) return <ResumeDocMockup />
  return (
    <img
      src={imgSrc}
      alt="Resume preview"
      className="resume-card__preview-image"
    />
  )
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
  const hasPdf = resumeUrl && resumeUrl.includes('.pdf')

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
              {hasPdf
                ? <PDFPreview src={resumeUrl} />
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

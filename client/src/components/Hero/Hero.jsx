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

export default function Hero() {
  const { site } = useSite()
  const { name, subtitle, resumeUrl, resumePreview, social } = site
  const resumeHref = resumeUrl || '/resume.pdf'
  const hasPreviewImage = Boolean(resumePreview)
  const isPdfResume = /\.pdf($|[?#])/i.test(resumeHref)
  const pdfPreviewUrl = isPdfResume
    ? `${resumeHref}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`
    : null

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
            download
            className={`resume-card${hasPreviewImage ? ' resume-card--preview' : pdfPreviewUrl ? ' resume-card--document' : ' resume-card--fallback'}`}
            aria-label="Download resume"
          >
            <div className="resume-card__preview" aria-hidden="true">
              {hasPreviewImage ? (
                <img src={resumePreview} alt="" className="resume-card__preview-image" />
              ) : pdfPreviewUrl ? (
                <div className="resume-card__preview-pdf-shell">
                  <iframe
                    src={pdfPreviewUrl}
                    title="Resume preview"
                    className="resume-card__preview-pdf"
                    tabIndex={-1}
                  />
                </div>
              ) : null}

              {hasPreviewImage || pdfPreviewUrl ? (
                <div className="resume-card__preview-overlay" />
              ) : (
                <div className="resume-card__fallback">
                  <span className="resume-card__fallback-flag mono">Resume</span>
                  <div className="resume-card__fallback-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>

            <div className="resume-card__veil" aria-hidden="true" />

            <div className="resume-card__content">
              <p className="resume-card__eyebrow mono">Download</p>
              <h2 className="resume-card__title">Resume</h2>
              <span className="resume-card__button">
                {RESUME_ICON}
                Download resume
              </span>
            </div>
          </a>
        </div>
      </div>

      <div className="hero__socials">
        {social.github && (
          <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hero__social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          </a>
        )}
        {social.linkedin && (
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hero__social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        )}
        {social.whatsapp && (
          <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hero__social-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        )}
        {social.email && (
          <a href={`mailto:${social.email}`} aria-label="Email" className="hero__social-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
          </a>
        )}
      </div>

      <div className="hero__scroll-hint">
        <span className="mono">scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}

import { useSite } from '../../context/SiteContext'
import './Contact.css'

export default function Contact() {
  const { site } = useSite()
  const { name, social } = site

  return (
    <section className="contact section" id="contact">
      <div className="container contact__inner">
        <p className="section-label">04. contact</p>
        <h2 className="section-title">Get in <span>Touch</span></h2>

        <p className="contact__intro">
        Whether you have a project in mind, want to collaborate, or are looking to hire — my inbox is always open.
        </p>

        <div className="contact__links">
          {social.email && (
            <a
              href={`mailto:${social.email}`}
              className="contact__email btn btn-primary"
            >
              Say Hello
            </a>
          )}

        </div>

        <footer className="contact__footer">
          <p className="mono">
            Built by <span className="sketch" style={{ color: 'var(--accent)', fontSize: '1.1em' }}>{name}</span>
            {' '}· {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </section>
  )
}

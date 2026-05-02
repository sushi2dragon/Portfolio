import { useState, useEffect } from 'react'
import { API_BASE } from '../../config'
import './Certifications.css'

// Map common issuer domains for favicon logos
const ISSUER_DOMAIN_MAP = {
  'coursera':        'coursera.org',
  'mathworks':       'mathworks.com',
  'matlab':          'mathworks.com',
  'ibm':             'ibm.com',
  'google':          'google.com',
  'aws':             'aws.amazon.com',
  'amazon':          'aws.amazon.com',
  'microsoft':       'microsoft.com',
  'deeplearning.ai': 'deeplearning.ai',
  'udemy':           'udemy.com',
  'edx':             'edx.org',
  'mit':             'mit.edu',
  'stanford':        'stanford.edu',
  'nvidia':          'nvidia.com',
  'cisco':           'cisco.com',
  'oracle':          'oracle.com',
  'meta':            'meta.com',
}

function getLogoUrl(cert) {
  if (cert.issuerLogo) return cert.issuerLogo
  if (cert.issuerDomain) return `https://www.google.com/s2/favicons?sz=64&domain=${cert.issuerDomain}`
  // Try to match issuer name against known map
  const lower = (cert.issuer || '').toLowerCase()
  for (const [key, domain] of Object.entries(ISSUER_DOMAIN_MAP)) {
    if (lower.includes(key)) return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
  }
  return null
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  if (!month) return year
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(month, 10) - 1]} ${year}`
}

const EXTERNAL_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

function CertCard({ cert }) {
  const logoUrl = getLogoUrl(cert)
  const initials = (cert.issuer || '?').slice(0, 2).toUpperCase()

  return (
    <div className="cert-card">
      <div className="cert-card__logo">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={cert.issuer}
            className="cert-card__logo-img"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <span
          className="cert-card__logo-fallback"
          style={{ display: logoUrl ? 'none' : 'flex' }}
        >
          {initials}
        </span>
      </div>

      <div className="cert-card__body">
        <span className="cert-card__name">{cert.name}</span>
        <span className="cert-card__meta">
          <span className="cert-card__issuer">{cert.issuer}</span>
          {cert.date && (
            <span className="cert-card__date mono">{formatDate(cert.date)}</span>
          )}
        </span>
      </div>

      {cert.credentialUrl && (
        <a
          href={cert.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cert-card__link"
          title="View credential"
          aria-label={`View ${cert.name} credential`}
        >
          {EXTERNAL_ICON}
        </a>
      )}
    </div>
  )
}

export default function Certifications() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/certifications`)
      .then(r => r.json())
      .then(data => { setCerts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && certs.length === 0) return null

  return (
    <section className="certifications section" id="certifications">
      <div className="container">
        <p className="section-label">03. credentials</p>
        <h2 className="section-title">Certifications & <span>Training</span></h2>

        {loading ? (
          <div className="certs-loading">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        ) : (
          <div className="certs-grid">
            {certs.map(cert => (
              <CertCard key={cert.id} cert={cert} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'About',           href: '#about' },
  { label: 'Projects',        href: '#projects' },
  { label: 'Certifications',  href: '#certifications' },
  { label: 'Contact',         href: '#contact' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href) => {
    setMenuOpen(false)
    if (!isHome) return
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text sketch">S.</span>
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={isHome ? href : `/${href}`}
                className="navbar__link"
                onClick={() => handleNavClick(href)}
              >
                <span className="mono navbar__num">0{NAV_LINKS.findIndex(l => l.label === label) + 1}.</span>
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__controls">
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          <button
            className={`menu-toggle ${menuOpen ? 'menu-toggle--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}

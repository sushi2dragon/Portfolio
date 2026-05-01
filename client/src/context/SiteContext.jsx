import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULT = {
  name: 'Sarthak',
  greeting: 'Hi, my name is',
  tagline: 'I build things.',
  subtitle: 'Developer & creator. I craft thoughtful digital experiences â€” from backends to interfaces, with a hand-drawn touch.',
  portrait: '',
  resumeUrl: '/resume.pdf',
  resumePreview: '',
  about: {
    bio: "Hey! I'm Sarthak â€” a developer who loves building things that live on the internet. Whether it's a slick UI, a robust backend, or a little Three.js magic, I like making ideas come to life with clean, thoughtful code.\n\nMy work spans full-stack development, with a particular fondness for creative interfaces. I'm always tinkering with something new and building projects that challenge me.",
    currentProject: 'This portfolio âœ¦',
    currentProjectId: null,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Three.js', 'Express', 'PostgreSQL', 'Git'],
  },
  social: {
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    whatsapp: 'https://wa.me/11234567890',
    email: 'your@email.com',
  },
}

const SiteContext = createContext(DEFAULT)

export function SiteProvider({ children }) {
  const [site, setSite] = useState(DEFAULT)

  useEffect(() => {
    fetch('/api/site')
      .then(r => r.json())
      .then(data => setSite({
        ...DEFAULT,
        ...data,
        about: { ...DEFAULT.about, ...data.about },
        social: { ...DEFAULT.social, ...data.social },
      }))
      .catch(() => {}) // silently fall back to defaults
  }, [])

  return <SiteContext.Provider value={{ site, setSite }}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)

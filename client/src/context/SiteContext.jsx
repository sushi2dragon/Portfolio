import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE, resolveUrl } from '../config'

const DEFAULT = {
  name: 'Sarthak',
  greeting: 'Hi, my name is',
  tagline: 'I build things.',
  subtitle: 'Student, Developer, and Full-time nerd. Im passionate about absorbing as much knowledge as I can and applying it to build apps and experiences to improve QoL.',
  portrait: '',
  resumeUrl: '/resume.pdf',
  resumePreview: '',
  about: {
    bio: “Hi, I'm Sarthak — a Cyber-Physical Systems student working across software, data, and real-world systems.\n\nMy experience spans spatial computing, geospatial tech, and computer vision. I'm particularly interested in understanding how systems behave—where they break, why they fail, and how they can be improved.\n\nI co-founded a startup focused on interactive geospatial experiences. Much of my work is driven by experimentation: using existing technologies to build practical, useful applications. That might take the form of AR/VR systems for indoor navigation, real-time 3D reconstruction tools, PC workflow utilities, or smaller projects that reduce friction in everyday tasks.\n\nI'm interested in computer vision, data systems, AR/VR, systems design, and full-stack development.”,
    currentProject: 'This portfolio ✦',
    currentProjectId: null,
    skills: ['Python', 'C++', 'Unity', 'Blender', 'TensorFlow', 'OpenCV', 'React', 'Node.js', 'Arduino', 'Three.js', 'JavaScript', 'C#', 'WebAR'],
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
    fetch(`${API_BASE}/api/site`)
      .then(r => r.json())
      .then(data => setSite({
        ...DEFAULT,
        ...data,
        portrait: resolveUrl(data.portrait),
        resumeUrl: resolveUrl(data.resumeUrl),
        resumePreview: resolveUrl(data.resumePreview),
        about: { ...DEFAULT.about, ...data.about },
        social: { ...DEFAULT.social, ...data.social },
      }))
      .catch(() => {}) // silently fall back to defaults
  }, [])

  return <SiteContext.Provider value={{ site, setSite }}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)

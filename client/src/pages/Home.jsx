import Hero from '../components/Hero/Hero'
import About from '../components/About/About'
import Projects from '../components/Projects/Projects'
import Certifications from '../components/Certifications/Certifications'
import Contact from '../components/Contact/Contact'

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Projects />
      <Certifications />
      <Contact />
    </main>
  )
}

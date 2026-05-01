import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { SiteProvider } from './context/SiteContext'
import Navbar from './components/Navbar/Navbar'
import ThreeBackground from './components/Hero/ThreeBackground'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import './index.css'

function AppInner() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return (
    <>
      {isHome && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <ThreeBackground />
        </div>
      )}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </SiteProvider>
    </ThemeProvider>
  )
}

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const w = mount.clientWidth
    const h = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
    camera.position.z = 80

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const PARTICLE_COUNT = 130
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

    // Particles start already spread across the scene — no intro cluster
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 160
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
    }

    // Drift velocities
    const velocities = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
      })
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 1.6,
      color: isDark ? 0xe07b39 : 0xc85a11,
      transparent: true,
      opacity: isDark ? 0.75 : 0.5,
    })

    const particles = new THREE.Points(geometry, particleMat)
    scene.add(particles)

    const lineMat = new THREE.LineBasicMaterial({
      color: isDark ? 0xe07b39 : 0xc85a11,
      transparent: true,
      opacity: isDark ? 0.13 : 0.08,
    })

    let linesMesh = null
    const MAX_DIST = 22

    function buildLines() {
      const pos = geometry.attributes.position.array
      const linePositions = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = pos[i * 3]     - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          if (Math.sqrt(dx * dx + dy * dy + dz * dz) < MAX_DIST) {
            linePositions.push(
              pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
              pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
            )
          }
        }
      }
      if (linesMesh) scene.remove(linesMesh)
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
      linesMesh = new THREE.LineSegments(lineGeo, lineMat)
      scene.add(linesMesh)
    }

    // Mouse repulsion
    const mouse3D = { x: 0, y: 0 }
    const mouseScreen = { x: -9999, y: -9999 }
    const REPULSE_RADIUS = 28
    const REPULSE_STRENGTH = 1.4

    const onMouseMove = (e) => {
      mouseScreen.x = e.clientX
      mouseScreen.y = e.clientY
      mouse3D.x =  (e.clientX / window.innerWidth  - 0.5) * 160
      mouse3D.y = -(e.clientY / window.innerHeight - 0.5) * 100
    }
    window.addEventListener('mousemove', onMouseMove)

    let frameCount = 0
    let animId

    const animate = () => {
      animId = requestAnimationFrame(animate)
      frameCount++

      const pos = geometry.attributes.position.array

      // Drift + mouse repulsion + bounce
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3]     += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y

        const dx = pos[i * 3]     - mouse3D.x
        const dy = pos[i * 3 + 1] - mouse3D.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPULSE_RADIUS && dist > 0.1) {
          const force = (REPULSE_RADIUS - dist) / REPULSE_RADIUS
          pos[i * 3]     += (dx / dist) * force * REPULSE_STRENGTH
          pos[i * 3 + 1] += (dy / dist) * force * REPULSE_STRENGTH
        }

        if (pos[i * 3]     >  80 || pos[i * 3]     < -80) velocities[i].x *= -1
        if (pos[i * 3 + 1] >  50 || pos[i * 3 + 1] < -50) velocities[i].y *= -1
      }

      geometry.attributes.position.needsUpdate = true
      if (frameCount % 2 === 0) buildLines()

      // Camera parallax
      const targetX =  (mouseScreen.x / window.innerWidth  - 0.5) * 22
      const targetY = -(mouseScreen.y / window.innerHeight - 0.5) * 14
      camera.position.x += (targetX - camera.position.x) * 0.06
      camera.position.y += (targetY - camera.position.y) * 0.06
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }

    buildLines()
    animate()

    const onResize = () => {
      const nw = mount.clientWidth
      const nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  )
}

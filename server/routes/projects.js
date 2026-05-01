const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const requireAuth = require('../middleware/auth')

const DATA_FILE = path.join(__dirname, '../data/projects.json')

const read = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
const write = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

// Public
router.get('/', (req, res) => {
  res.json(read())
})

router.get('/:id', (req, res) => {
  const project = read().find(p => p.id === req.params.id)
  if (!project) return res.status(404).json({ error: 'Not found' })
  res.json(project)
})

// Admin only
router.post('/', requireAuth, (req, res) => {
  const projects = read()
  const project = {
    id: Date.now().toString(),
    title: req.body.title || 'Untitled',
    description: req.body.description || '',
    longDescription: req.body.longDescription || '',
    tags: req.body.tags || [],
    github: req.body.github || '',
    liveUrl: req.body.liveUrl || '',
    screenshots: req.body.screenshots || [],
    isProprietaryWork: req.body.isProprietaryWork || false,
    createdAt: new Date().toISOString(),
  }
  projects.unshift(project)
  write(projects)
  res.status(201).json(project)
})

router.put('/:id', requireAuth, (req, res) => {
  const projects = read()
  const idx = projects.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })

  projects[idx] = { ...projects[idx], ...req.body, id: projects[idx].id }
  write(projects)
  res.json(projects[idx])
})

router.delete('/:id', requireAuth, (req, res) => {
  const projects = read()
  const idx = projects.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })

  projects.splice(idx, 1)
  write(projects)
  res.json({ ok: true })
})

module.exports = router

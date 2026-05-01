const router = require('express').Router()
const requireAuth = require('../middleware/auth')
const Project = require('../models/Project')
const { SuggestionError, suggestTagsForProject } = require('../services/tagSuggester')

router.post('/tags/suggest', requireAuth, async (req, res) => {
  try {
    const result = await suggestTagsForProject({
      description: req.body.description,
      longDescription: req.body.longDescription,
      github: req.body.github,
      screenshots: req.body.screenshots,
      existingTags: req.body.existingTags,
    })
    res.json(result)
  } catch (error) {
    const status = error instanceof SuggestionError ? error.status : 500
    res.status(status).json({ error: error.message || 'Unable to suggest tags.', warnings: error.warnings || [] })
  }
})

// Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean()
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id }).lean()
    if (!project) return res.status(404).json({ error: 'Not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin only
router.post('/', requireAuth, async (req, res) => {
  try {
    const project = await Project.create({
      id: Date.now().toString(),
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      longDescription: req.body.longDescription || '',
      tags: req.body.tags || [],
      github: req.body.github || '',
      liveUrl: req.body.liveUrl || '',
      screenshots: req.body.screenshots || [],
      isProprietaryWork: req.body.isProprietaryWork || false,
      projectDate: req.body.projectDate || '',
      createdAt: new Date().toISOString(),
      category: req.body.category || 'personal',
      status: req.body.status || 'completed',
    })
    res.status(201).json(project.toObject())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { _id, id, ...updates } = req.body
    const project = await Project.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()
    if (!project) return res.status(404).json({ error: 'Not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await Project.findOneAndDelete({ id: req.params.id })
    if (!result) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

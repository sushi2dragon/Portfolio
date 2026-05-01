const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const requireAuth = require('../middleware/auth')

const SITE_FILE = path.join(__dirname, '../data/site.json')

const read = () => JSON.parse(fs.readFileSync(SITE_FILE, 'utf8'))
const write = (data) => fs.writeFileSync(SITE_FILE, JSON.stringify(data, null, 2))

// Public — frontend reads this
router.get('/', (req, res) => {
  res.json(read())
})

// Admin only — deep merge to avoid wiping nested keys
router.put('/', requireAuth, (req, res) => {
  const current = read()
  const updated = {
    ...current,
    ...req.body,
    about: { ...current.about, ...(req.body.about || {}) },
    social: { ...current.social, ...(req.body.social || {}) },
  }
  write(updated)
  res.json(updated)
})

module.exports = router

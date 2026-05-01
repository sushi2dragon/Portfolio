const router = require('express').Router()
const requireAuth = require('../middleware/auth')
const Site = require('../models/Site')

router.get('/', async (req, res) => {
  try {
    const site = await Site.findOne({}).lean()
    res.json(site || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/', requireAuth, async (req, res) => {
  try {
    const current = await Site.findOne({}).lean() || {}
    const updated = {
      ...current,
      ...req.body,
      about: { ...current.about, ...(req.body.about || {}) },
      social: { ...current.social, ...(req.body.social || {}) },
    }
    delete updated._id
    const site = await Site.findOneAndUpdate(
      {},
      { $set: updated },
      { new: true, upsert: true }
    ).lean()
    res.json(site)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

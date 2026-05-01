const router = require('express').Router()
const requireAuth = require('../middleware/auth')
const Certification = require('../models/Certification')

router.get('/', async (req, res) => {
  try {
    const certs = await Certification.find({}).lean()
    res.json(certs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const cert = await Certification.create({ ...req.body, id: Date.now().toString() })
    res.json(cert.toObject())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { _id, id, ...updates } = req.body
    const cert = await Certification.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()
    if (!cert) return res.status(404).json({ error: 'Not found' })
    res.json(cert)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Certification.findOneAndDelete({ id: req.params.id })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const requireAuth = require('../middleware/auth')

const CERT_FILE = path.join(__dirname, '../data/certifications.json')

const read = () => {
  if (!fs.existsSync(CERT_FILE)) return []
  return JSON.parse(fs.readFileSync(CERT_FILE, 'utf8'))
}
const write = (data) => fs.writeFileSync(CERT_FILE, JSON.stringify(data, null, 2))

router.get('/', (req, res) => res.json(read()))

router.post('/', requireAuth, (req, res) => {
  const certs = read()
  const cert = { ...req.body, id: Date.now().toString() }
  certs.push(cert)
  write(certs)
  res.json(cert)
})

router.put('/:id', requireAuth, (req, res) => {
  let certs = read()
  certs = certs.map(c => c.id === req.params.id ? { ...c, ...req.body, id: c.id } : c)
  write(certs)
  res.json(certs.find(c => c.id === req.params.id))
})

router.delete('/:id', requireAuth, (req, res) => {
  const certs = read().filter(c => c.id !== req.params.id)
  write(certs)
  res.json({ ok: true })
})

module.exports = router

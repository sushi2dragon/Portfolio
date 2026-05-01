const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const requireAuth = require('../middleware/auth')

const UPLOADS_DIR = path.join(__dirname, '../uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
    const name = `${Date.now()}-${safeBase || 'upload'}${ext}`
    cb(null, name)
  },
})

const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})

const galleryUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith('image/') ||
               file.mimetype.startsWith('video/') ||
               file.mimetype === 'application/pdf'
    if (!ok) return cb(new Error('Only image, video, and PDF files are allowed'))
    cb(null, true)
  },
})

const resumeUpload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf'
    if (!isPdf) {
      return cb(new Error('Only PDF files are allowed'))
    }
    cb(null, true)
  },
})

const uploadUrl = (filename) => {
  const base = process.env.BACKEND_URL || ''
  return `${base}/uploads/${filename}`
}

router.post('/', requireAuth, imageUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: uploadUrl(req.file.filename) })
})

router.post('/gallery', requireAuth, galleryUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: uploadUrl(req.file.filename) })
})

router.post('/resume', requireAuth, resumeUpload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: uploadUrl(req.file.filename) })
})

module.exports = router

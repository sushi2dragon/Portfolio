const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { Readable } = require('stream')
const cloudinary = require('cloudinary').v2
const requireAuth = require('../middleware/auth')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Keep files in memory — no disk needed
const memStorage = multer.memoryStorage()

const imageUpload = multer({
  storage: memStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'))
    cb(null, true)
  },
})

const galleryUpload = multer({
  storage: memStorage,
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
  storage: memStorage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf'
    if (!isPdf) return cb(new Error('Only PDF files are allowed'))
    cb(null, true)
  },
})

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    Readable.from(buffer).pipe(stream)
  })

router.post('/', requireAuth, imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio',
      resource_type: 'image',
    })
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/gallery', requireAuth, galleryUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/gallery',
      resource_type: 'auto',
    })
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/resume', requireAuth, resumeUpload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'portfolio/resume',
      resource_type: 'image',
      format: 'pdf',
      use_filename: true,
      unique_filename: true,
    })
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

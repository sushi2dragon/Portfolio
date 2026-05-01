require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/site', require('./routes/site'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/certifications', require('./routes/certifications'))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server running on :${PORT}`))

const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/login', async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Password required' })

  const match = await bcrypt.compare(password, process.env.ADMIN_HASH)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' })
  res.json({ token })
})

module.exports = router

const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: 'Untitled' },
  description: { type: String, default: '' },
  longDescription: { type: String, default: '' },
  tags: [String],
  github: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  screenshots: [String],
  isProprietaryWork: { type: Boolean, default: false },
  projectDate: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  category: { type: String, default: 'personal' },
  status: { type: String, default: 'completed' },
})

module.exports = mongoose.model('Project', projectSchema)

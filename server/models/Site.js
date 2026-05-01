const mongoose = require('mongoose')

const siteSchema = new mongoose.Schema({
  name: String,
  greeting: String,
  tagline: String,
  subtitle: String,
  portrait: String,
  resumeUrl: String,
  resumePreview: String,
  about: {
    bio: String,
    currentProject: String,
    currentProjectId: mongoose.Schema.Types.Mixed,
    skills: [String],
  },
  social: {
    github: String,
    linkedin: String,
    instagram: String,
    whatsapp: String,
    email: String,
  },
}, { strict: false })

module.exports = mongoose.model('Site', siteSchema)

const mongoose = require('mongoose')

const certSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  issuer: String,
  issuerDomain: String,
  issuerLogo: String,
  date: String,
  credentialUrl: String,
})

module.exports = mongoose.model('Certification', certSchema)

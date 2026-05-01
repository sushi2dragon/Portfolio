require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const Project = require('../models/Project')
const Certification = require('../models/Certification')
const Site = require('../models/Site')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const projects = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/projects.json'), 'utf8'))
  const certs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/certifications.json'), 'utf8'))
  const site = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/site.json'), 'utf8'))

  await Project.deleteMany({})
  await Project.insertMany(projects)
  console.log(`Seeded ${projects.length} projects`)

  await Certification.deleteMany({})
  await Certification.insertMany(certs)
  console.log(`Seeded ${certs.length} certifications`)

  await Site.deleteMany({})
  await Site.create(site)
  console.log('Seeded site data')

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(err => { console.error(err); process.exit(1) })

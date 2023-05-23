const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const contactsRouter = require('./routes/api/contacts')
const authRouter = require('./routes/api/auth')
const app = express()
app.use('/public', express.static('public'))

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactsRouter)
app.use('/api/auth', authRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})
app.use((err, req, res, next) => {
  if (err.message.includes('Cast to ObjectId failed')) {
    res.status(400).json({ message: 'ID is not valid' })
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message })
  }

  const { status = 500, message = 'Server error' } = err
  res.status(status).json({ message })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app

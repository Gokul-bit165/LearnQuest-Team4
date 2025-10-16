// Main API entry point
const express = require('express')
const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())

// Import routes
// const authRoutes = require('./routes/auth')
// const courseRoutes = require('./routes/courses')

// Use routes
// app.use('/api/auth', authRoutes)
// app.use('/api/courses', courseRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})

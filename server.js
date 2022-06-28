const express = require('express')
const connectDB = require('./config/db')
const fileUpload = require('express-fileupload')

const app = express()

// Connect database
connectDB()

// Init Middleware /* to allow req.body */
app.use(express.json({extended: false}))
// Upload files
app.use(fileUpload({ limits: { fileSize: 1024 * 1024 * 5 /* 5MB */ }, createParentPath: true }))

app.get('/', (req, res)=> res.send('API Running'))

// Define Routes
app.use('/api/users',require('./routes/api/users'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/profile',require('./routes/api/profile'))
app.use('/api/courses',require('./routes/api/courses'))

const PORT = process.env.PORT || 5000

app.listen(PORT,()=> console.log(`Server started on port ${PORT}`) )
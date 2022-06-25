const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const config = require('config')
const { check, validationResult } = require('express-validator')





// @route   GET api/users/recent
// @desc    Get recent users
// @access  public
router.get('/recent', async (req,res)=>{
    try {
        const users = await User.find().sort({ date:-1 }).select('avatar') // Get the recent users
        res.json(users)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router
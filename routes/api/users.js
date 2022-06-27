const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const config = require('config')
const { check, validationResult } = require('express-validator')

router.post('/', [
    check('firstname','First name is required').not().isEmpty(),
    check('lastname','Last name is required').not().isEmpty(),
    check('email','Please include a valid email address').isEmail(),
    check('password','Password must be at least 6 characters').isLength({ min: 6 }),
    check('gender','Gender is required').not().isEmpty(),
    check('birthdate','Please include a valid birthdate').isDate({format: 'DD-MM-YYYY'})
], async (req,res) =>{
    
})

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
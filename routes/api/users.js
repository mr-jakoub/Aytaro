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
    check('birthdate','Please include a valid birthdate').isDate({format: 'YYYY-MM-DD'})
], async (req,res) =>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    let { accountType, firstname, lastname, email, phone, password, gender, birthdate } = req.body
    try {
        // Check if user exists
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [{msg: `Hey ${user.firstname} 😃 you are already one of us`}] })
        }
        
        // Get users avatar
        const avatar = "default"
        user = new User({
            accountType,
            firstname,
            lastname,
            email,
            password,
            gender,
            phone,
            avatar,
            birthdate
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        
        // Return JWT
        const payload = {
            user:{
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'), {expiresIn : config.get('jwtExpiresIn')}, (err, token)=>{
            if (err) throw err
            res.json({ token })
        })
    }catch(err){
        console.log(err.message)
        res.status(500).send('Server Error')
    }
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
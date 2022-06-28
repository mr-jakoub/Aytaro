const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const {check, validationResult} = require('express-validator')

// @route   PUT api/profile/follow/:id
// @desc    Follow & Unfollow a user
// @access  Private
router.put('/follow/:id', auth, async (req,res)=>{
    try {
        const profile = await Profile.findById(req.params.id)
        const Myprofile = await Profile.findOne({ user: req.user.id })
        let result = {}
        if(req.user.id === profile.user.toString()){
            return res.status(400).json({ errors: [{msg: "You can't follow yourself"}] })
        }
        // Check if the user has already been followed
        if(profile.followers.filter(follower=> follower.user.toString() === req.user.id).length > 0){
            // Get remove index Profile
            const removeIndexProfile = profile.followers.map(follower=> follower.user.toString()).indexOf(req.user.id)
            profile.followers.splice(removeIndexProfile, 1)
            await profile.save()
            // Get remove index Myprofile
            const removeIndexMyprofile = Myprofile.following.map(followed=> followed.user.toString()).indexOf(profile.user.toString())
            Myprofile.following.splice(removeIndexMyprofile, 1)
            await Myprofile.save()
            result = {
                followers: profile.followers,
                following: Myprofile.following
            }
            return res.json(result)
        }
        console.log(Myprofile)
        profile.followers.unshift({ user: req.user.id })
        Myprofile.following.unshift({ user: profile.user.toString()})
        await profile.save()
        await Myprofile.save()
        result = {
            followers: profile.followers,
            following: Myprofile.following
        }
        res.json(result)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/profile
// @desc    Get all profiles
// @access  public
router.get('/', async (req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name', 'avatar', 'accountType'])
        res.json(profiles)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/profile/:id
// @desc    Get profile by user ID
// @access  public
router.get('/:id', async (req,res)=>{
    try {
        const profile = await Profile.findOne({ user:req.params.id }).populate('user',["-password"])
        if(!profile) return res.status(400).json({ msg: 'Profile not found !' })
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found !' })
        }
        res.status(500).send('Server Error')
    }
})

// @route   POST api/profile
// @desc    Update user profile
// @access  Private
router.post('/',[ auth, [
    check('name','Name is required').not().isEmpty(),
    check('email','Please include a valid email address').isEmail(),
    check('phone','Please include a phone number').isMobilePhone(),
    check('gender','Gender is required').not().isEmpty(),
    check('birthdate','Please include a valid birthdate').isDate({format: 'YYYY-MM-DD'})
] ], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    let { name, email, phone, location, birthdate, gender, bio, skills } = req.body
    // Check if the email is not used
    let user = await User.findById(req.user.id)
    let otherUser = await User.findOne({ email })
    if (otherUser && email !== user.email) {
        return res.status(400).json({ errors: [{msg: 'Email already used'}] })
    }
    // Avatar
    if(req.files){
        let avatar = req.files.avatar
        //check type of image we will accept only png || jpg || jpeg
        if (!avatar.mimetype.includes('jpeg') && !avatar.mimetype.includes('png') && !avatar.mimetype.includes('jpg') && !avatar.mimetype.includes('gif')) {
            return res.statut(400).json({ errors: 'Please include a valid image format "png, jpg, jpeg, gif "' })
        }
        //check file size max file 5 megabyte
        if (avatar.size > 1024 * 1024 * 5) { return res.statut(400).json({ errors: 'The file is too large' })}
    }
    let randomID = Math.floor(Math.random() * 1000) + req.user.id
    // Fill user fields
    const userFields = { name, email, phone, gender, birthdate }
    for(const [key, value] of Object.entries(userFields)) {
        if (value && value.length > 0) {
            userFields[key] = value
        }
    }
    if(req.files){
        userFields.avatar = `/upload/avatar/${randomID + req.files.avatar.name.replace(' ','')}`
    }else{
        userFields.avatar = user.avatar
    }
    // Fill profile fields
    const profileFields = { location, bio }
    for(const [key, value] of Object.entries(profileFields)) {
        if (value && value.length > 0) {
            profileFields[key] = value
        }
    }
    if(skills) profileFields.skills = skills.split(',').map(skill=>skill.trim())

    try{
        profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { upsert: true, new: true }).populate('user',['name', 'avatar', 'email', 'phone', 'accountType'])
        await User.findOneAndUpdate({ _id: req.user.id }, { $set: userFields }, { upsert: true, new: true })
        return res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(100).send('Server Error')
    }
})

module.exports = router
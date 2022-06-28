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

module.exports = router
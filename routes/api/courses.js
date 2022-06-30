const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Course = require('../../models/Course')
const {check, validationResult} = require('express-validator')
const Profile = require('../../models/Profile')
const courseAccess = require('../../middleware/courseAccess')

// @route   POST api/courses
// @desc    Create course
// @access  Private
router.post('/', [ auth, [
    check('title','Course title is required').not().isEmpty(),
    check('description','Course description is required').not().isEmpty(),
    check('categories','Include at least one category please').not().isEmpty(),
    check('languages','Include at least one language please').not().isEmpty(),
    check('price','Course price is required').not().isEmpty(),
    check('sections','Course price is required').not().isEmpty(),

] ], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const { title, description, categories, languages, requirements, price, coupon, sections } = req.body
        // Fill Course fields
        const courseFields = { user: user.id, title, description, price, coupon }
        for(const [key, value] of Object.entries(courseFields)) {
            if (value && value.length > 0) {
                courseFields[key] = value
            }
        }
        if(categories) courseFields.categories = categories.split(',').map(category=>category.trim())
        if(languages) courseFields.languages = languages.split(',').map(language=>language.trim())
        if(requirements) courseFields.requirements = requirements.split(',').map(requirement=>requirement.trim())
        // Build sections [{...},{...}]
        courseFields.sections = sections
        const newCourse = new Course(courseFields)
        const course = await newCourse.save()

        // Add course to /profile/courses
        const profile = await Profile.findOne({ user: req.user.id })
        profile.courses.unshift({ course: course._id })
        await profile.save()

        res.json(course)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   PUT api/courses/rise/:id
// @desc    rise a course
// @access  Private
router.put('/rise/:id', auth, async (req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        // Check if the course has already been rised
        if(course.rises.filter(rise=> rise.user.toString() === req.user.id).length > 0){
            // Get remove index
            const removeIndex = course.rises.map(rise=> rise.user.toString()).indexOf(req.user.id)
            course.rises.splice(removeIndex, 1)
            await course.save()
            return res.json(course.rises)
        }
        course.rises.unshift({ user: req.user.id })
        await course.save()
        res.json(course.rises)
    } catch (err) {
        res.status(500).send('Server Error')
    }
})

// @route   DELETE api/courses/:id
// @desc    Delete course
// @access  Private
router.delete('/:id', auth, async (req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        if(!course) return res.status(404).json({ msg: 'Course not found !' })
        // Check if the owner of the course who will delete it
        if(course.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'You are not authorized' })
        }
        await course.remove()
        res.json({ msg: 'Your course permanently deleted !' })
    } catch (err) {
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Course not found !' })
        }
        res.status(500).send('Server Error')
    }
})

// @route   PUT api/courses/participate/:id
// @desc    participate on a course
// @access  Private
router.put('/participate/:id', auth, async (req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        // Check if the user has already been participated
        if(course.participants.filter(participant=> participant.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ errors: [{msg: `You have already participated`}] })
        }
        course.participants.unshift({ user: req.user.id })
        await course.save()
        res.json(course.participants)
    } catch (err) {
        res.status(500).send('Server Error')
    }
})

// @route   GET api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req,res)=>{
    try {
        const courses = await Course.find().sort({ date:-1 }) // Get the recent courses
        if(req.headers['aytaro-auth-token'] && req.user){
            // Is authenticated
            return res.json(courseAccess(courses, req.user.id))
        }
        res.json(courseAccess(courses))
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, async (req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        if(!course) return res.status(404).json({ msg: 'Course not found !' })
        res.json(courseAccess([course], req.user.id))
    } catch (err) {
        console.log(err.message)
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Post not found !' })
        }
        res.status(500).send('Server Error')
    }
})

module.exports = router
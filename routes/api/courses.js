const express = require('express')
const uuid = require('uuid')
const fs = require('fs')
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
    check('language','Include at least one language please').not().isEmpty(),
    check('funds','Course price is required').not().isEmpty(),
    check('level','Level is required').not().isEmpty(),
    check('sections','Please include at leat one section').not().isEmpty(),

] ], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors)
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const { title, description, categories, language, requirements, willLearn, funds, level, coupons, sections } = req.body
        // Fill Course fields
        const courseFields = { user: user.id, avatar: user.avatar, name: user.name, title, description, coupons, level }
        for(const [key, value] of Object.entries(courseFields)){
            if (value && value.length > 0) {
                courseFields[key] = value
            }
        }
        // Handle arrays
        courseFields.funds = JSON.parse(funds)
        courseFields.languages = language.split(',').map(language=>language.trim())
        if(categories) courseFields.categories = categories
        if(requirements) courseFields.requirements = requirements
        if(willLearn) courseFields.willLearn = willLearn
        // Thumbnail
        const courseId = uuid.v4()
        // pass the folderId to the title to use it whene we delete it
        courseFields.title = `${title}@${courseId}`
        const courseDir = `./client/public/courses/${user.id}@${courseId}`
        if(!fs.existsSync(courseDir)){
            await fs.mkdirSync(courseDir)
            await req.files.thumbnail.mv(`./client/public/courses/${user.id}@${courseId}/${req.files.thumbnail.name.replaceAll(' ','')}`)
            courseFields.thumbnail = `/courses/${user.id}@${courseId}/${req.files.thumbnail.name.replaceAll(' ','')}`
            // Build sections [{...},{...}]
            courseFields.sections = JSON.parse(sections)
            // Build videos
            courseFields.sections.forEach(section=>{
                let item = 'video__' + section.title.split('@')[1]
                section.videos.forEach(async (video, key)=>{
                    console.log(req.files[item])
                    // Check if there is more than 1 video
                    if(req.files[item][key]){
                        video.directory = `/courses/${user.id}@${courseId}/${req.files[item][key].name.replaceAll(' ','')}`
                        req.files[item][key].mv(`./client/public/courses/${user.id}@${courseId}/${req.files[item][key].name.replaceAll(' ','')}`)
                    }else{
                        // If there is 1 video no need to the key
                        video.directory = `/courses/${user.id}@${courseId}/${req.files[item].name.replaceAll(' ','')}`
                        await req.files[item].mv(`./client/public/courses/${user.id}@${courseId}/${req.files[item].name.replaceAll(' ','')}`)
                    }
                })
            })
        }

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
        const user = await User.findById(req.user.id)
        // Check if the course has already been rised
        if(course.rises.filter(rise=> rise.user.toString() === req.user.id).length > 0){
            // Get remove index
            const removeIndex = course.rises.map(rise=> rise.user.toString()).indexOf(req.user.id)
            course.rises.splice(removeIndex, 1)
            await course.save()
            return res.json(course.rises)
        }
        course.rises.unshift({ user: req.user.id, name: user.name })
        await course.save()
        res.json(course.rises)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

// @route   DELETE api/courses/:id
// @desc    Delete course
// @access  Private
router.delete('/:id', auth, async (req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
        const profile = await Profile.findOne({ user: req.user.id })
        const courseId = course.title.split('@')[1]
        if(!course) return res.status(404).json({ msg: 'Course not found !' })
        // Check if the owner of the course who will delete it
        if(course.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'You are not authorized' })
        }
        // Remove course folder
        fs.rmSync(`./client/public/courses/${req.user.id}@${courseId}`, { recursive: true, force: true })
        // Remove from profile courses
        const removeIndex = profile.courses.map(crs=> crs.course.toString()).indexOf(req.params.id)
        profile.courses.splice(removeIndex, 1)
        await profile.save()
        await course.remove()
        res.json({ msg: 'Your course permanently deleted !' })
        return res.json(profile.courses)
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
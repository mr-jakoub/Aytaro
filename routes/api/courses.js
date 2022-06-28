const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Course = require('../../models/Course')
const {check, validationResult} = require('express-validator')

// @route   POST api/courses
// @desc    Create course
// @access  Private
router.post('/', [ auth, [
    check('title','Course title is required').not().isEmpty(),
    check('description','Course description is required').not().isEmpty(),
    check('categories','Include at least one category please').not().isEmpty(),
    check('languages','Include at least one language please').not().isEmpty(),
    check('price','Course price is required').not().isEmpty(),

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
        // Build sections

        const newCourse = new Course(courseFields)
        const course = await newCourse.save()
        res.json(course)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router
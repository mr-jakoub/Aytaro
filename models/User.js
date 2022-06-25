const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    account_type:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        default: 0
    },
    gender:{
        type: String,
        required: true
    },
    avatar:{
        type: String
    },
    birthdate:{
        type: Date,
        required: true
    },
    secret_word:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
})

module.exports = User = mongoose.model('user',UserSchema)
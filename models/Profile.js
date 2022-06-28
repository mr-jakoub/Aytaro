const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    validated:{
        type: Boolean,
        default: false
    },
    rank:{
        type: String,
        default: "Bronze"
    },
    courses:[
        {
            course:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }
        }
    ],
    followers:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    following:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    rises:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            Ntime:{
                type: Number
            }
        }
    ],
    location:{
        type: String
    },
    bio:{
        type: String
    },
    skills:{
        type: [String]
    }
})

module.exports = User = mongoose.model('Profile',ProfileSchema)
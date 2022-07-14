const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CourseSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    categories:{
        type: [String],
        required: true
    },
    languages:{
        type: [String],
        required: true
    },
    requirements:{
        type: [String],
        default: ['No requirements']
    },
    willLearn:{
        type: [String],
        required: true
    },
    funds:[
        {
            price:{
                type: Number,
                required: true
            },
            currency: {
                type: String,
                default: 'DZD'
            }
        }
    ],
    coupons:{
        type: [String]
    },
    avatar:{
        type: String
    },
    name:{
        type: String
    },
    thumbnail:{
        type: String
    },
    stars:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            // [ 1 - 5 ]
            Nstar:{
                type: Number
            }
        }
    ],
    rises:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            name:{
                type: String
            }
        }
    ],
    participants:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            text:{
                type: String,
                required: true
            },
            likes:[
                {
                    user:{
                        type: Schema.Types.ObjectId,
                        ref: "User"
                    }
                }
            ],
            dislikes:[
                {
                    user:{
                        type: Schema.Types.ObjectId,
                        ref: "User"
                    }
                }
            ],
            date:{
                type: Date,
                default: Date.now
            }
        }
    ],
    sections:[
        {
            title:{
                type: String,
                required: true
            },
            videos:[
                {
                    directory:{
                        type: String
                    },
                    title:{
                        type: String,
                        required: true
                    },
                    duration:{
                        type: Number
                    },
                    public:{
                        type: Boolean,
                        default: false
                    }
                }
            ],
            ressources:[
                {
                    directory:{
                        type: String
                    },
                    title:{
                        type: String,
                        required: true
                    }
                }
            ]
        }
    ],
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = Course = mongoose.model('Course',CourseSchema)
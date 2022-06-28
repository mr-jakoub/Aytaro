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
    price:{
        type: Number,
        currency: {
            type: String,
            default: 'DZD'
        },
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    coupon:{
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
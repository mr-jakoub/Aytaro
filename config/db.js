const mongoose = require('mongoose')
const config = require('config')
const dbURI = config.get('aytaroURI')

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI,
            {
				useNewUrlParser: true,
				useUnifiedTopology: true
			}
        )
        console.log('database connected...')
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB
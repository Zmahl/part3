const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

const uniqueValidator = require('mongoose-unique-validator')

mongoose.connect(url).then(() => {
    console.log('connected to MongoDB')
})
    .catch(error => {
        console.log('error connecting to MongoDB', error.message)
    })


const phonebookSchema = new mongoose.Schema ({
    //Used to check for unique names
    name: {
        type: String,
        unique: true,
        minLength: [3, 'name must be at least 3 characters']
    },
    number: {
        type: String,
        minLength: [8, 'Phone number must be at least 8 characters']
    }
})

phonebookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

phonebookSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Person', phonebookSchema)


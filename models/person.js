const { MongoMissingCredentialsError } = require('mongodb')
const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');
const url = process.env.MONGODB_URI

mongoose.connect(url).then(result => {
    console.log("connected to MongoDB")
}).catch(error => {
    console.log("error conencting to MongoDB", error.message)
})

const personScheme = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        unique: true,
        minLength: 3
    },
    number : {
        type: Number,
        required: true,
        validate: {
            validator: function(val) {
                return val.toString().length > 7
            },
            message: val => `${val.value} has to be 8 digits`
        }
    }
})

personScheme.plugin(uniqueValidator);

personScheme.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personScheme)

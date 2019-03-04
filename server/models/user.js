// schema for users
// external libraries/modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// creating schema
let User = new Schema({
    full_name: {
        type: String,
        required: [true, "can't be blank"]
    },
    email: {
        type: String, 
        lowercase: true, 
        unique: true, 
        required: [true, "can't be blank"], 
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    is_valid: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        default: '',
    },
    noOfUsers: {
        type: Number,
        required: true,
        trim: true,
        minlength:1,
        default: 0
    }
});

User.plugin(passportLocalMongoose);

// creating model with Schema
module.exports = mongoose.model('User', User);
// schema for users
// external libraries/modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// creating schema
let User = new Schema({
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
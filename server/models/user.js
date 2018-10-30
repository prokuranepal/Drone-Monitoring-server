// schema for users
// external libraries/modules
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// creating schema
let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        trim: true, //removes leading and trailing spaces
        unique: true,
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    location: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    noOfUsers: {
        type: Number,
        required: true,
        trim: true,
        minlength:1,
        default: 0
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject,['_id', 'username']);
};

// some middleware for authentication and tokenizing
UserSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access},'abc123').toString();

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (token) {
    let user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });

};

UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token,'abc123');
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        _id : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
};

UserSchema.statics.findByCredentialsWebsite = function (username,password,location) {
    let User = this;

    return User.find({username: username,location: location})
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }

            return new Promise((resolve,reject) => {
                bcrypt.compare(password, user[0].password, (err, res) => {
                    if(res) {
                        resolve(user[0]);
                    } else {
                        reject();
                    }
                });
            });
        });
};

UserSchema.statics.findByCredentialsAndroid = function (username,password) {
    let User = this;

    return User.findOne({username: username})
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }

            return new Promise((resolve,reject) => {
                bcrypt.compare(password, user[0].password, (err, res) => {
                    if(res) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        });
};

UserSchema.pre('save', function (next) {
    let user = this;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(user.password,salt,(errs,hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// creating model with Schema
let User = mongoose.model('User', UserSchema);

module.exports = {User};

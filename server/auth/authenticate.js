const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user,done) => {
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id, (err,user) => {
        done(err,user);
    });
});
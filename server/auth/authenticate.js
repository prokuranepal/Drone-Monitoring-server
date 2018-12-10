const {User} = require('../models/user');

let authenticate = (req, res, next) => {
    console.log(req.headers);
    let token = req.header('x-auth');
    console.log(`${token} inside authenticate`);
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((err) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};
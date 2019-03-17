const express = require('express');
const email = require('../email/email');

/**
 * importing lodash
 */
const _ = require('lodash');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const mongoStore = require('connect-mongo')(session);
const fs = require('fs');
const flash = require('req-flash');
/**
 * requiring the authenticate middleware
 */
const authenticate = require('../auth/authenticate');

/**
 * it is used so that both socketIO and express can run simultaneously
 * it is available in core library.
 */
const http = require('http');

/**
 * setting up express app
 */
const app = express();

/**
 * import user model and droneName model
 */
let User = require('../models/user');
let DroneName = require('../models/drone');
let Client = require('../models/client');

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * It is used for parsing the data send by the clients.
 */
const bodyparser = require('body-parser');

/**
 * Public path defination
 */
const publicPath = path.join(__dirname, '../..', '/public'),
    views = path.join(__dirname, '../..', '/public/views');

/**
 * setting up middleware at public directory which is displayed in browser
 * in the main directory '/' file should be index.ejs
 */
app.use(express.static(publicPath));

app.set('views', views);

app.set('view engine', 'ejs');

/**
 * to parse json objects
 */
app.use(bodyparser.json());

/**
 * to parse post request or urlencoded data
 */
app.use(bodyparser.urlencoded({ extended: true }));

/**
 * Session based login middleware and the data is stored in mongodb
 */
app.use(session({
    name: 'session-id',
    secret: process.env.secret,
    cookie: {
        maxAge: new Date(Date.now() + 86400000)
    },
    saveUninitialized: false,
    resave: false,
    store: new mongoStore({
        url: process.env.MONGODB_URI,
        autoRemove: 'native'
    })
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

/**
 * created a http server to use express
 */
const server = http.createServer(app);

/**
 * get and post route of '/'
 * get is used for rendering the index.ejs file
 * post is used for authenticating of the user for login
 * and redirect to '/status' if success or to '/' if
 * failed
 */


app.get('/', (req, res) => {
    DroneName.find({}).select('-_id -__v').sort({drone_name:'asc'}).exec()
        .then((drones) => {
            let allAdd = {"drone_name":"all","drone_location":"all"};
            drones[drones.length] = allAdd;
            res.status(200).render('index', {
                title: 'Drone | login',
                drones: drones,
                error:req.flash('errorMessageIndex')
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/', (req, res, next) => {
    let body = _.pick(req.body, ['location']);
    passport.authenticate('local', function (err, user, info) {
        console.log('Inside post request of /');
        if (err) {
            req.flash('errorMessageIndex','Sorry, User cannot be authenticated');
            res.statusCode = 401;
            return res.redirect('/');
        }
        if (!user) {
            req.flash('errorMessageIndex','Sorry, User cannot be found');
            res.statusCode = 401;
            return res.redirect('/');
        }
        if (!user.is_valid) {
            req.flash('errorMessageIndex','Sorry, User is not valid please contact the administrator');
            res.statusCode = 401;
            return res.redirect('/');
        }
        user.location = body.location;
        user.save().catch((err) => console.log('cannot save user'));

        req.logIn(user, function (err) {
            if (err) {
                console.log('Inside post request of / with login error');
                req.flash('errorMessageIndex','Sorry, User cannot be authenticated');
                res.statusCode = 401;
                return res.redirect('/');
            }
            res.statusCode = 200;
            console.log('Inside post request of / with login succesfull');
            // res.cookie('user-id',user.username);
            return res.redirect('/' + body.location);
        });
    })(req, res, next);
});
/********************************************************************/

app.get('/create_user', (req, res) => {
    res.status(200).render('signupPage', {
        title: 'Signup Page',
        error: req.flash('errorMessageSignUp')
    });
});


/**
 * for creating user
 */
app.post('/signup', (req, res) => {
    if (req.body.password === req.body.password1) {
        var mailOptions = {
            from: 'nicnepal.udacity@gmail.com',
            to: 'nicnepal.github@gmail.com',
            subject: 'User verification',
            text: `user with name ${req.body.fullname} and email address ${req.body.email} want to create account for drone monitoring system`
        };
        User.register(new User({ username: req.body.username ,email: req.body.email, full_name: req.body.fullname}),
            req.body.password, (err, user) => {
                if (err) {
                    req.flash('errorMessageSignUp','Sorry, User cannot be created');
                    res.redirect('/create_user');
                } else {
                    if (req.body.location) {
                        user.location = req.body.location;
                    }
                    email.sendMail(mailOptions)
                        .then((info) => {
                            console.log('Email sent: ' + info.response);
                        })
                        .catch((error) => {
                            return console.log(error);
                        });

                    user.save((err, user) => {
                        if (err) {
                            req.flash('errorMessageSignUp','Sorry, User cannot be created');
                            res.redirect('/create_user');
                        }
                        passport.authenticate('local')
                            (req, res, () => {
                                res.statusCode = 200;
                                req.flash('errorMessageSignUp','User was succesfully created');
                                res.redirect('/create_user');
                            });
                    });
                }
            });
    } else {
        req.flash('errorMessageSignUp','Password Doesnot match');
        res.redirect('/create_user');
    }
});
/********************************************************************/

/**
 * TODO: need to upgrade according to the app
 * for login in android
 */
app.post('/android', passport.authenticate('local'), (req, res) => {
    let body = _.pick(req.body, ['username', 'password']);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.send('OK');
});
/********************************************************************/

function auth(req, res, next) {
    if (!req.user) {
        req.flash('errorMessageIndex','Sorry, User is not authenticated');
        res.statusCode = 401;
        return res.redirect('/');
    } else {
        next();
    }
}

app.use(auth);

/**
 * to render the statusall.ejs in /stautsall
 */
app.get('/all', (req, res) => {
    User.findById(req.session.passport.user, (err, user) => {
        if (err) {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        var urlString = '/' + user.location;
        if (urlString != req.url) {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        res.render('statusall');
    });
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/default', (req, res) => {
    User.findById(req.session.passport.user, (err, user) => {
        if (err) {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        var urlString = '/' + user.location;
        if (urlString != req.url) {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        res.render('status', { href: "../datadefault.txt" });
    });
});
/********************************************************************/

/**
 * Cpanel pages
 */
app.get('/cpanel',(req,res) => {
    User.findById(req.session.passport.user).exec()
        .then((user) => {
            if (user.is_admin === true) {
                User.find({}).select('-_id -noOfUsers -__v').sort({_id:'desc'}).exec()
                    .then((user) => {
                        res.render('cpanel/cpanelmain',{
                            title:"Cpanel",
                            users: user,
                            companyName: "NIC"
                        });
                    })
                    .catch((err) => {
                        return console.log(err);
                    });
            } else {
                res.statusCode = 401;
                req.flash('errorMessageIndex','Sorry, You are not authorized');
                return res.redirect('/');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authorized');
            return res.redirect('/');
        });
});

app.post('/cpanel/update',(req,res) => {
    User.findById(req.session.passport.user).exec()
        .then((user) => {
            if (user.is_admin === true) {
                User.findOne({username:req.body.username,full_name: req.body.full_name,email:req.body.email}).exec()
                    .then((user) => {
                        user.is_valid = req.body.is_valid;
                        user.is_admin = req.body.is_admin;
                        user.save()
                            .then((success) => {
                                res.statusCode = 200;
                                res.json("successfully update");
                            })
                            .catch((err) => {
                                res.json("Cannot save user");
                            });
                    })
                    .catch((err) => {
                        res.json("Cannot find user");
                    });
            } else {
                res.statusCode = 401;
                req.flash('errorMessageIndex','Sorry, You are not authorized');
                return res.redirect('/');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authorized');
            return res.redirect('/');
        });
});

app.get('/cpanel/planes',(req,res) => {
    User.findById(req.session.passport.user).exec()
        .then((user) => {
            if (user.is_admin === true) {
                DroneName.find({}).select('drone_name drone_location -_id').sort({drone_name:'asc'}).exec()
                    .then((drone) => {
                        res.render('cpanel/cpanelplanes',{
                            title:"Cpanel",
                            planes: drone,
                            companyName: "NIC"
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                res.statusCode = 401;
                req.flash('errorMessageIndex','Sorry, You are not authorized');
                return res.redirect('/');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authorized');
            return res.redirect('/');
        });
});

app.post('/cpanel/planes/update',(req,res) => {
    User.findById(req.session.passport.user).exec()
        .then((user) => {
            if (user.is_admin === true) {
                let addDrone = new DroneName({drone_name: req.body.planeName,drone_location: req.body.planeLocation});
                addDrone.save()
                    .then((success) => {
                        res.statusCode = 200;
                        
                        // create socket file by reading the socket file
                        let writeFilePath = path.join(__dirname,`../socketio/${req.body.planeName}Socket.js`);
                        let readFilePath = path.join(__dirname,'../socketio/JT601Socket.js');
                        fs.readFile(readFilePath, 'utf8', function (err,data) {
                            if (err) {
                            return console.log(err);
                            }
                            var result = data;
                            for (let i= 0; i<5; i++) {
                                result = result.replace('JT601', req.body.planeName);
                            }
                            fs.writeFile(writeFilePath, result, 'utf8', function (err) {
                            if (err) return console.log(err);
                            });
                        });
                        //
                        // to make directory to store files
                        let dataFileDirectory = path.join(__dirname,'../..',`public/data/${req.body.planeName}`);
                        fs.mkdir(dataFileDirectory,(err) => {
                            if (err) {
                                return console.log(err);
                            }
                            fs.closeSync(fs.openSync(path.join(dataFileDirectory,'/.gitkeep'), 'w'));
                        });
                        //
                        // to create a database schema
                        let databaseFilePath = path.join(__dirname,'../models/droneData.js');
                        fs.appendFile(databaseFilePath, `\nconst ${req.body.planeName}DroneData = mongoose.model("${req.body.planeName}DroneData",DroneSchema);\nconst ${req.body.planeName}Count = mongoose.model("${req.body.planeName}Count",DroneCountSchema);\n\nmodule.exports.${req.body.planeName}DroneData = ${req.body.planeName}DroneData;\nmodule.exports.${req.body.planeName}Count = ${req.body.planeName}Count;\n`, (err) => {  
                            if (err) {
                                return console.log(err);
                            };
                        });

                        res.json("successfully update");
                    })
                    .catch((err) => {
                        console.log(err)
                    });
            } else {
                res.statusCode = 401;
                req.flash('errorMessageIndex','Sorry, You are not authorized');
                return res.redirect('/');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authorized');
            return res.redirect('/');
        });
});

app.get('/cpanel/users',(req,res) => {
    User.findById(req.session.passport.user).exec()
        .then((user) => {
            if (user.is_admin === true) {
                Client.find({}).select('-__v -_id').sort({_id:'desc'}).exec()
                    .then((users) => {
                        res.render('cpanel/cpanelusers',{
                            title:"Cpanel",
                            users: users,
                            companyName: "NIC"
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                res.statusCode = 401;
                req.flash('errorMessageIndex','Sorry, You are not authorized');
                return res.redirect('/');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authorized');
            return res.redirect('/');
        });
});

/**********************************************************************/

// GET /logout
app.get('/logout', function(req, res, next) {
    User.findById(req.session.passport.user, (err, user) => {
        if (err) {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        if (req.session) {
            // delete session object
            req.session.destroy((err)  => {
                if(err) {
                    req.flash('errorMessageIndex','Sorry, Cannot logout');
                    return res.redirect('/');
                }
                return res.redirect('/');
            });
        }
    });
  });

  //////
app.get('/:droneName', (req, res) => {
    User.findById(req.session.passport.user).exec()
        .then((user) => {
            if (user.location === req.params.droneName) {
                DroneName.findOne({ drone_name: req.params.droneName }).select('drone_name drone_location -_id').exec()
                    .then((drone) => {
                        if (user.is_admin === true) {
                            return res.render('status',{ href: "/" + drone.drone_name + "/data",add_button:true});
                        }
                        return res.render('status', { href: "/" + drone.drone_name + "/data" ,add_button:false});
                    })
                    .catch((err) => {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                        return res.redirect('/');
                    });
            } else {
                res.statusCode = 401;
                req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                return res.redirect('/');
            }
        })
        .catch((err) => {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        });
});

/**
 * to render the file.ejs to show data that can be downloaded by the user
 */
app.get('/:droneName/data', (req, res) => {
    User.findById(req.session.passport.user, (err, user) => {
        let href = [];
        let status = [];
        let i = 0;
        if (err) {
            console.log('error in finding user');
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        let urlString = '/' + user.location + '/data';
        if (urlString != req.url) {
            res.statusCode = 401;
            req.flash('errorMessageIndex','Sorry, You are not authenitcated');
            return res.redirect('/');
        }
        let droneDataPath = path.join(__dirname, '../..', '/public/data/' + user.location + '/');
        let files = fs.readdirSync(droneDataPath);
        files = files.splice(1);
        files.forEach(file => {
            let data = {
                fileName: '../data/' + user.location + '/' + file,
                fileTime: fs.statSync(path.join(droneDataPath, file)).birthtime.toUTCString()
            };
            href.push(data);
        });
        res.render('file', {
            title: "data of " + user.location,
            data: href
        });
    });
});


module.exports = server;
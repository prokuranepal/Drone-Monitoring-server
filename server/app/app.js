/**
 * TODO : comment on express
 */
const express = require('express');

/**
 * importing lodash
 */
const _ = require('lodash');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const mongoose = require('mongoose');

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
 * import user model and mongoose
 */
let {User} = require('../models/user');

/**
 * requiring the authenticate middleware
 */
//let {authenticate} = require('../auth/authenticate');

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

/**
 * TODO: comment required for views folder
 */
app.set('views', views);

/**
 * TODO: comment required for view engine
 */
app.set('view engine', 'ejs');

/**
 * to parse json objects
 */
app.use(bodyparser.json());

/**
 * to parse post request or urlencoded data
 */
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

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

// Add headers
/*app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,x-auth');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});*/



app.get('/', (req, res) => {
    res.status(200).render('index',{title:'Drone | login'});
});

app.post('/', (req, res) => {
    let body = _.pick(req.body,['username','password','location']);

    if (!req.session.user) {
        var authHeader = req.headers.authorization;
        console.log(authHeader);
        /*if (!authHeader) {
            var err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate','Basic');
            err.status = 401;
            return res.redirect('/');
        }*/

        //var auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
        var username = body.username;
        var password = body.password;

        User.findOne({username:username, location:body.location})
            .then((user) => {
                if(user === null) {
                    var err = new Error('Username doesnot match');
                    err.status = 403;
                    return res.redirect('/');
                } else if(user.password != password) {
                    var err = new Error('Password doesnot match');
                    err.status = 403;
                    return res.redirect('/');
                } else if (user.username === username && user.password === password){
                    console.log('hey');
                    //res.cookie('user', 'admin', {signed:true});
                    req.session.user = 'authenticated';
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.redirect('/'+ body.location);
                }
            })
            .catch((err) => next(err));

    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type','text/plain');
        //res.end('You are already authenticated');
        res.redirect('/'+ body.location);
    }

    /*User.findByCredentialsWebsite(body.username,body.password,body.location)
        .then((user) => {
            return user.generateAuthToken().then((token) => {
                console.log(`login successful`);
                console.log(token);
                return  res.header('x-auth',token).status(200).render('index',{title:'Drone | login'});
            });
        })
        .catch((e) => {
            console.log(`username or password incorrect ${e}`);
            return res.status(404).redirect('/');
        });*/
});
/********************************************************************/

/**
 * for login in android
 */
app.post('/android', (req, res) => {

    let body = _.pick(req.body,['username','password']);

    User.findByCredentialsAndroid(body.username,body.password)
        .then((user) => {
            return res.send('OK');
        })
        .catch((e) => {
            console.log(`username or password incorrect ${e}`);
            return res.send('login failed');
        });
});
/********************************************************************/

/**
 * for creating user
 */
app.post('/login',(req,res) => {
    let body = _.pick(req.body,['username','password','location']);
    let user = new User(body);

    user.save().then((user) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth',token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    })
});
/********************************************************************/

/**
 * to delete the token
 * only done using postman
 */
app.delete('/token',(req,res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});
/********************************************************************/

//auth

function auth(req, res, next) {
    //console.log(req.signedCookies);
    console.log(req.session);

    //if(!req.signedCookies.user) {
    if (!req.session.user) {
        var err = new Error('You are not authenticated!');
        err.status = 403;
        return res.redirect('/');

    } else {
        //if (req.signedCookies.user === 'admin'){
        if(req.session.user == 'authenticated') {
            next();
        } else {
            var err = new Error('You are not authenticated');
            err.status = 403;
            return res.redirect('/');
        }
    }
}

app.use(auth);

/**
 * to render the status.ejs in /status
 */
app.get('/default',(req, res) => {
    res.render('status',{href:"../datadefault.txt"});
    //res.render('test');
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/nangi', (req, res) => {
    res.render('status', {href:"../dataNangi.txt"});
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/pulchowk',(req, res) => {
    res.render('status', {href: "../dataPulchowk.txt"});
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/dharan',(req, res) => {
    res.render('status', {href: "../dataDharan.txt"});
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/dhangadi',(req, res) => {
    res.render('status', {href: "../dataDhangadi.txt"});
});
/********************************************************************/

/**
 * to render the statusall.ejs in /stautsall
 */
app.get('/all',(req, res) => {
    res.render('statusall');
});
/********************************************************************/

module.exports = server;
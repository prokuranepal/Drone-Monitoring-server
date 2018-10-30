/**
 * TODO : comment on express
 */
const express = require('express');

/**
 * importing lodash
 */
const _ = require('lodash');

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
let {authenticate} = require('../auth/authenticate');

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
    res.status(200).render('index',{title:'Drone | login'});
});

app.post('/', (req, res) => {
    let body = _.pick(req.body,['username','password','location']);

    User.findByCredentialsWebsite(body.username,body.password,body.location)
        .then((user) => {
            return user.generateAuthToken().then((token) => {
                console.log(`login successful`);
                return  res.header('x-auth',token).status(200).redirect('/'+body.location);
            });
        })
        .catch((e) => {
            console.log(`username or password incorrect ${e}`);
            return res.status(404).redirect('/');
        });
});
/********************************************************************/

/**
 * to render the status.ejs in /status
 */
app.get('/default',(req, res) => {
    //console.log(req)
    res.render('status',{href:"../datadefault.txt"});
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


module.exports = server;
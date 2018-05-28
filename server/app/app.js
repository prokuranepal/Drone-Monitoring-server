/**
 * TODO : comment on express
 */
const express = require('express');

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
 * in the main directory '/' file should be index.html
 */
app.use(express.static(publicPath));

/**
 * TODO: comment required for views folder
 */
app.set('views', views);

/**
 * TODO: comment required for ejs
 */
app.engine('html', require('ejs').renderFile);

/**
 * TODO: comment required for view engine
 */
app.set('view engine', 'html');

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
 * get is used for rendering the index.html file
 * post is used for authenticating of the user for login
 * and redirect to '/status' if success or to '/' if
 * failed
 */

app.get('/', (req, res) => {
    res.status(200).render('index.html');
});

app.post('/', (req, res) => {
    User.find({
        username: req.body.username
    }, {
        _id: 0,
        password: 1
    }).then((user) => {
        if ((user.length != 0) && (user[0].password === req.body.password)) {
            return res.status(200).redirect('/status');
        } else {
            console.log(`username or password incorrect`);
            return res.status(404).redirect('/');
        }
    });
});
/********************************************************************/

/**
 * for login in android
 */
app.post('/android', (req, res) => {
    User.find({
        username: req.body.username
    }, {
        _id: 0,
        password: 1
    }).then((user) => {
        if ((user.length != 0) && (user[0].password === req.body.password) && (user[0].noOfUsers === 0)) {
            /**
             * TODO: query to update the noOfUsers to 1 of userSchema
             */
            return res.send('OK');
        } else {
            console.log(`username or password incorrect`);
            return res.send('login failed');
        }
    });
});
/********************************************************************/

/**
 * to render the status.html in /status
 */
app.get('/status', (req, res) => {
    res.render('status.html');
    res.end();
});
/********************************************************************/

module.exports = server;
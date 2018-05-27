/**
 * TODO: how to use HTTP /2 protocol
 */

/**
 * configuration of database is stored in config file
 */
require('./config/config');

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * It is used for parsing the data send by the clients.
 */
const bodyparser = require('body-parser');

/**
 * it is used so that both socketIO and express can run simultaneously
 * it is available in core library.
 */
const http = require('http');

/**
 * TODO : comment on express
 */
const express = require('express');

/**
 * It is used for websocket connections between the client
 */
const socketIO = require('socket.io');

//const backup = require('mongodb-backup');

/**
 * local imports
 */
let {
    mongoose
} = require('./db/mongoose');
let {
    DroneData
} = require('./models/droneData');
let {
    User
} = require('./models/user');
/********************************************************************/

/**
 * The path constant for required files
 */
const publicPath = path.join(__dirname, '..', '/public'),
    views = path.join(__dirname, '..', '/public/views'),
    actualmissionfile = path.join(__dirname, '..', '/public/js/files/mission.txt'),
    renamedmissionfile = path.join(__dirname, '..', '/public/js/files/oldmission.txt'),
    datafile = path.join(__dirname, '..', '/public/data.txt');
/********************************************************************/

/**
 * setting the port at which the server run
 */
const port = process.env.PORT || 3000;

/**
 * setting up express app
 */
const app = express();

/**
 * created a http server to use express
 */
const server = http.createServer(app);

/**
 * configuring server to use socket io , websocket first and long polling second
 */
/*const io = socketIO(server, {
    transports: ['websocket','polling']
});*/

/**
 * io for accessing the socket functionality
 */
const io = socketIO(server);

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

/*app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false
}));*/

/**
 * local variables
 */
let Android = [],
    Website = [],
    Pi = [],
    lat,
    lng;
/********************************************************************/

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
app.post('/android', (req,res) => {
    User.find({
        username: req.body.username
    }, {
        _id: 0,
        password: 1
    }).then((user) => {
        if ((user.length != 0) && (user[0].password === req.body.password)) {
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

/**
 * to confirm the connection status with the client
 */
io.on('connection', (socket) => {

    /**
     * to join the particular devices
     * joinPi to join the socket of pi
     * joinWebsite to join the socket of website
     * joinAndroid to join the socket of android
     */
    socket.on('joinPi', () => {
        Pi.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi) connected`);

    });

    socket.on('joinWebsite', () => {
        Website.push(socket.id);
        socket.join('website');
        console.log(`${socket.id} (Website) connected`);
        // console.log(socket.nsp.server.eio.clients);
    });

    socket.on('joinAndroid', () => {
        Android.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android device) connected`);
    });
    /******************** Join device completed *************************/


    /**
     * This socket is listening to pi socket which relayed the message
     * to android socket about the success of auto arm of copter.
     */
    socket.on('success', (msg) => {
        io.to('android').emit('success', msg);
    });
    /********************************************************************/

    /**
     * This socket is listening to pi socket for the continuous data of
     * copter about the state and positions.
     * And the received data are relayed to the website for Graphical view
     * Also the data is store in the mongodb database
     */
    socket.on('data', (data) => {
        io.to('website').emit('copter-data', data);
        lat = data.lat;
        lng = data.lng;
        var droneData = new DroneData(data);
        droneData.save().then(() => {
            //console.log('data has been saved.');
        }, (e) => {
            console.log('data cannot be saved.');
        });
    });
    /********************************************************************/

    /**
     * This socket is listening to pi socket for the home lat and lng of
     * the copter after the gps lock has been established in the copter.
     * And the received home location is emitted to the website
     */
    socket.on('homePosition', (homeLocation) => {
        io.to('website').emit('homePosition', homeLocation);
    });
    /********************************************************************/

    /**
     * This socket is listening for the error messages send by the clients
     * (pi and android) the error message is received in the format of
     * {'context': 'something', 'msg':'something'}
     * The error message is send to the website and the context is used
     * for determining the task to be done before sending to the website
     */
    socket.on('error', (error) => {
        io.to('website').emit('error', error.msg);
        if (error.context == 'GPS/Mission') {
            fs.readFile(renamedmissionfile, (err, waypoints) => {
                if (err) {
                    return console.log('no mission file ');
                }
                io.to('website').emit('Mission', JSON.parse(waypoints));
            });
        } else if (error.context == 'Prearm') {
            io.to('android').emit('success', error.msg);
        } else if (error.context == 'Connection') {
            io.to('android').emit('success', error.msg);
        }
    });
    /********************************************************************/

    /**
     * This socket is listening to pi for the way-points of mission
     * and the way-points are send to the website for display and save to
     * the file called 'actualmissionfile'
     */
    socket.on('waypoints', (waypoints) => {
        io.to('website').emit('Mission', waypoints);
        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });
    /********************************************************************/

    /**
     * This socket is listening to website client for requesting the pi to
     * download the mission file.
     * In the process the actualmissionfile is renamed to renamedmissionfile
     * so to differentiate the new and old mission file.
     * And the request is emitted to the pi socket
     */
    socket.on('getMission', (msg) => {
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (!err) {
                console.log('rename done');
            }
            console.log('No actual mission file present');
        });
        io.to('pi').emit('mission_download', msg);
    });
    /********************************************************************/

    /**
     * This socket is listening to android socket which initiates the auto
     * flight mode in the copter.
     * The command received from the android socket is emitted to the pi
     * socket for initiating the flight
     */
    socket.on('fly', (msg) => {
        io.to('pi').emit('initiate_flight', msg);
    });
    /********************************************************************/

    /**
     * to confirm the disconnected status with the client
     */
    socket.on('disconnect', () => {
        let indexWebsite = Website.indexOf(socket.id),
            indexAndroid = Android.indexOf(socket.id),
            indexPi = Pi.indexOf(socket.id);

        if (indexWebsite > -1) {
            Website.splice(indexWebsite, 1);
            console.log(`${socket.id} (Website) disconnected`);
        }
        if (indexAndroid > -1) {
            Android.splice(indexAndroid, 1);
            console.log(`${socket.id} (Android device) disconnected`);
        }
        if (indexPi > -1) {
            Pi.splice(indexPi, 1);
            io.to('website').emit('copter-data', {
                /**
                 * data format needed to send to the client when pi disconnect
                 */
                conn: 'False',
                fix: 0,
                numSat: 0,
                hdop: 10000,
                arm: 'False',
                head: 0,
                ekf: 'False',
                mode: 'UNKNOWN',
                status: 'UNKNOWN',
                volt: 0,
                gs: 0,
                as: 0,
                altr: 0,
                alt: 0,
                est: 0,
                lidar: 0,
                lat: lat,
                lng: lng
            });
            console.log(`${socket.id} (Pi) disconnected`);

            /*// backup({
            //   uri: process.env.MONGODB_URI,
            //   root: './',
            //   collection: ['dronedats'],
            //   parser: 'json'
            // });
            // the above method saves all fields and also saves each document to separate json file

            // find method doesn't return the fields mentioned
            // in second bracket called projections
            // the fields whose value are 0 are not included*/

            var fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            var db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                DroneData.find({}, {
                    tokens: 0,
                    __id: 0,
                    _id: 0,
                    __v: 0
                }).cursor().on('data', function (doc) {
                    fileStream.write(doc.toString() + '\n');
                }).on('end', function () {
                    fileStream.end();
                    // check if collection exists and then dropped
                    db_native.listCollections({
                        name: 'dronedats'
                    })
                        .next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                DroneData.collection.drop();

                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        }
    });

});

/**
 * setting up a server at port 3000 or describe by process.env.PORT
 */
server.listen(port, () => {
    console.log(`Server running at ${port}`);
});

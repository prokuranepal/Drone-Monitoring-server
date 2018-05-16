require('./config/config');
// it is used inorder to create the path towards the folder or file nice and readable
// it is available in core library.
const path = require('path');

const fs = require('fs');
//const session = require('express-session');

const bodyparser = require('body-parser');
// it is used so that both socketIO and express can run simultaneously
// it is available in core library.
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');
//const backup = require('mongodb-backup');

// local imports
let {
  mongoose
} = require('./db/mongoose');
let {
  DroneData
} = require('./models/droneData');

const publicPath = path.join(__dirname, '..', '/public');
const views = path.join(__dirname, '..', '/public/views');

const missionfile = path.join(__dirname, '..', '/public/js/files/mission.txt');
const datafile = path.join(__dirname, '..', '/public/data.txt');

// setting the port at which the server run
const port = process.env.PORT || 3000;

// setting up express app
const app = express();

// created a http server to use express
const server = http.createServer(app);

// configuring server to use socket io , websocket first and long polling second
/*const io = socketIO(server, {
    transports: ['websocket','polling']
});*/
const io = socketIO(server);

// setting up middleware at public directory which is displayed in browser in the main directory '/' file should be index.html
app.use(express.static(publicPath));
app.set('views', views);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));

/*app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false
}));*/

let Android = [],
  Website = [],
  Pi = [],
  parameters;

app.route('/')
  .get((req, res) => {
    res.render('index.html');
  })
  .post((req, res) => {
    User.find({
      username: req.body.username
    }, {
      _id: 0,
      password: 1
    }).
    then((user) => {
      if ((user.length != 0) && (user[0].password === req.body.password)) {
        res.redirect('/status');
      } else {
        console.log(`${req.body.username} or password incorrect`);
        res.redirect('/');
      }
    });
  });

app.get('/status', (req, res) => {
  res.render('status.html');
});

// to confirm the connection status with the client
io.on('connection', (socket) => {

  // Pi
  socket.on('joinPi', () => {
    Pi.push(socket.id);
    socket.join('pi');
    console.log(`${socket.id} (Pi) connected`);
  });

  socket.on('success', (msg) => {
    // to android for successful take off
    io.to('android').emit('success', msg);
  });

  socket.on('data', (data) => {
    io.to('website').emit('copter-data', data);
    parameters = data;
    var droneData = new DroneData(parameters);
    droneData.save().then(() => {
      //console.log('data has been saved.');
    }, (e) => {
      console.log('data cannot be saved.');
    });
  });

  socket.on('homePosition', (homeLocation) => {
    io.to('website').emit('homePosition', homeLocation);
  });

  socket.on('error', (msg) => {
    console.log(msg);
    // to android for error
    io.to('website').emit('error', msg);
  });

  socket.on('waypoints', (waypoints) => {
    fs.writeFile(missionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });

  // Website
  socket.on('joinWebsite', () => {
    Website.push(socket.id);
    socket.join('website');
    console.log(`${socket.id} (Website) connected`);
  });

  socket.on('getMission', (msg) => {
    io.to('pi').emit('mission_download', msg);
  });

  // Android
  socket.on('joinAndroid', () => {
    Android.push(socket.id);
    socket.join('android');
    console.log(`${socket.id} (Android device) connected`);
  });

  socket.on('fly', (msg) => {
    // send data to pi to initiate flight.
    io.to('pi').emit('initiate_flight', msg);
  });

  // to confirm the disconnected status with the client
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

      parameters.conn = 'False';
      parameters.fix = 0;
      parameters.numSat = 0;
      parameters.hdop = 10000;
      parameters.arm = 'False';

      io.to('website').emit('copter-data', parameters);
      console.log(`${socket.id} (Pi) disconnected`);

      // backup({
      //   uri: process.env.MONGODB_URI,
      //   root: './',
      //   collection: ['dronedats'],
      //   parser: 'json'
      // });
      // the above method saves all fields and also saves each document to separate json file

      // find method doesn't return the fields mentioned
      // in second bracket called projections
      // the fields whose value are 0 are not included

      var fileStream = fs.createWriteStream(datafile);
      fileStream.once('open', (no_need) => {
        DroneData.find({}, {
          tokens: 0,
          __id: 0,
          _id: 0,
          __v: 0
        }).cursor().
        on('data', function(doc) {
          fileStream.write(doc.toString() + '\n');
        }).on('end', function() {
          fileStream.end();
          DroneData.collection.drop();
          console.log('********** the file has been written and db is dropped.');
        });
      });

    }
  });

});

// setting up a server at port 3000 or describe by process.env.PORT
server.listen(port, () => {
  console.log(`Server running at ${port}`);
});

// it is used inorder to create the path towards the folder or file nice and readable
// it is available in core library.
const path = require('path');

const fs = require('fs');

//const mysql = require('mysql');

const bodyparser = require('body-parser');
// it is used so that both socketIO and express can run simultaneously
// it is available in core library.
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname,'..','/public');
const missionfile = path.join(__dirname,'..','/public/js/files/mission.txt');

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

app.use(bodyparser.json());

let x = 1,
    toFlight=0,
    Android = [],
    Website = [],
    Pi = [];

let checkTimeOutT = setTimeout(() => {
    console.log('timeout beyond time');
}, 6000);

// to confirm the connection status with the client
io.on('connection', (socket) => {
    console.log("connected");

    socket.on('joinPi', () => {
        Pi.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi) connected`);
    });

    socket.on('joinWebsite', () => {
        Website.push(socket.id);
        socket.join('website');
        console.log ( `${socket.id} (Website) connected`);
    });

    socket.on('joinAndroid',() => {
        Android.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android device) connected`);
    });


    app.get('/data',(req,res) => {
        io.to('website').emit('copter-data', req.query);
        clearTimeout(checkTimeOutT);

        checkTimeOutT = setTimeout(() => {
            let data = req.query;
            data.conn = 'False';
            x = 1;
            io.to('website').emit('copter-data',data);
        }, 6000);
        res.send(`${x}`);

    });

    app.get('/waypoints', (req,res) => {
        fs.writeFile(missionfile,JSON.stringify(req.body,undefined,2), (err) => {
            if(err) {
                return console.log(err);
            }
        });
        x = 0;
        res.send("made");
    });

    app.get('/flight', (req,res) => {
        console.log(req.query.flight);
        res.send(`${toFlight}`);
        toFlight = 0;
    });

    socket.on('message', (msg) => {
        console.log(msg.hello);
        x= msg;
    });

    socket.on('fly', (msg) => {
        console.log(msg);
        toFlight = msg;
        io.emit('aaa_response',"hello");
        io.to('android').emit('response',"Go to Hell");
    });

    // to confirm the disconnected status with the client
    socket.on('disconnect', () => {
        let indexWebsite = Website.indexOf(socket.id),
            indexAndroid = Android.indexOf(socket.id),
            indexPi = Pi.indexOf(socket.id);
/*
        socket.leave('website'||'android');*/

        if (indexWebsite > -1) {
            Website.splice(indexWebsite,1);
            socket.leave('website');
            console.log(`${socket.id} (Website) disconnected`);
        }
        if (indexAndroid > -1) {
            Android.splice(indexAndroid,1);
            socket.leave('android');
            console.log(`${socket.id} (Android device) disconnected`);
        }
        if (indexPi > -1 ){
            Pi.splice(indexPi,1);
            socket.leave('pi');
            console.log(`${socket.id} (Pi) disconnected`);
        }

    });
});

// setting up a server at port 3000 or describe by process.env.PORT
server.listen(port, () => {
    console.log(`Server running at ${port}`);
});

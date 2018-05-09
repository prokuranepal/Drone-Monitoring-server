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
    Android = [],
    Website = [],
    Pi = [],
    parameters;


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
        io.to('android').emit('success',msg);
    });

    socket.on('data', (data) => {
        parameters = data;
        io.to('website').emit('copter-data', data);
    });

    socket.on('waypoints', (waypoints) => {
        console.log(waypoints);
        fs.writeFile(missionfile,JSON.stringify(waypoints,undefined,2), (err) => {
            if(err) {
                return console.log(err);
            }
        });
    });

    // Website
    socket.on('joinWebsite', () => {
        Website.push(socket.id);
        socket.join('website');
        console.log ( `${socket.id} (Website) connected`);
    });

    socket.on('getMission', (msg) => {
        io.to('pi').emit('mission_download',msg);
        console.log(msg);
    });

    // Android
    socket.on('joinAndroid',() => {
        Android.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android device) connected`);
    });

    socket.on('fly', (msg) => {
        // send data to pi to initiate flight.
        io.to('pi').emit('initiate_flight',msg);
    });

    /*app.get('/waypoints', (req,res) => {
        fs.writeFile(missionfile,JSON.stringify(req.body,undefined,2), (err) => {
            if(err) {
                return console.log(err);
            }
        });
        x = 0;
        res.send("made");
    });*/

    socket.on('message', (msg) => {
        console.log(msg);
        x= msg;
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
            parameters.conn = 'False';
            io.to('website').emit('copter-data', parameters);
            parameters = 0;
        }

    });
});

// setting up a server at port 3000 or describe by process.env.PORT
server.listen(port, () => {
    console.log(`Server running at ${port}`);
});

// it is used inorder to create the path towards the folder or file nice and readable
// it is available in core library.
const path = require('path');

const fs = require('fs');

const math = require('mathjs');

const bodyparser = require('body-parser');
// it is used so that both socketIO and express can run simultaneously
// it is available in core library.
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname,'..','/public');
const missionfile = path.join(__dirname,'..','/public/js/mission.txt');

// setting the port at which the server run
const port = process.env.PORT || 3000;

// setting up express app
const app = express();

// created a http server to use express
const server = http.createServer(app);

// configuring server to use socket io
const io = socketIO(server);

// setting up middleware at public directory which is displayed in browser in the main directory '/' file should be index.html
app.use(express.static(publicPath));

app.use(bodyparser.json());

let x = 1;
var flag = 'True';
var currentTime;
var checkTimeOutT = setTimeout(() => {
    console.log('timeout beyond time');
    }, 6000);

// to confirm the connection status with the client
io.on('connection', (socket) => {
    console.log('connected with the client');

    app.get('/data',(req,res) => {
        socket.broadcast.emit('copter-data', req.query);
        clearTimeout(checkTimeOutT);
        checkTimeOutT = setTimeout(() => {
            var data = req.query;
            data.conn = 'False';
            socket.broadcast.emit('copter-data',data);
        }, 6000);
        res.send(`${x}`);

    });

    app.get('/waypoints', (req,res) => {

        //socket.broadcast.emit('waypoints', req.body);
        fs.writeFile(missionfile,JSON.stringify(req.body,undefined,2), (err) => {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

        x = 0;
        res.send("made");

    });

    app.get('/android', (req,res) => {
        res.send("you did it");
    });

    socket.on('message', (msg) => {
        x= msg;
    });

    // to confirm the disconnected status with the client
    socket.on('disconnect', () => {
        console.log('disconnected form the client');
    });
});



// setting up a server at port 3000 or describe by process.env.PORT
server.listen(port, () => {
    console.log(`Server running at ${port}`);
});

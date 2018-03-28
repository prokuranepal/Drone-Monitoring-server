// it is used inorder to create the path towards the folder or file nice and readable
// it is available in core library.
const path = require('path');

// it is used so that both socketIO and express can run simultaneously
// it is available in core library.
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname,'..','/public');

// setting the port at which the server run
const port = process.env.PORT || 3000;

// setting up express app
var app = express();

// created a http server to use express
var server = http.createServer(app);

// configuring server to use socket io
var io = socketIO(server);

// setting up middleware at public directory which is displayed in browser in the main directory '/' file should be index.html
app.use(express.static(publicPath));

// to confirm the connection status with the client
io.on('connection', (socket) => {
    console.log('connected with the client');

    app.get('/data' ,(req,res) => {
        var currentTime = new Date().getTime();
        io.emit('copter-data', req.query);
        res.send('data');
        var lastTime = new Date().getTime();
        console.log(lastTime-currentTime);
    });

    /*app.post('/data', (req, res) => {
        var currentTime = new Date().getTime();
        console.log(req.body);
       /!* io.emit('copter-data', req.query);
        res.send('data');*!/
        var lastTime = new Date().getTime();
        console.log(lastTime-currentTime);
    });*/

    // to confirm the disconnected status with the client
    socket.on('disconnect', () => {
        console.log('disconnected form the client');
    });
});

// setting up a server at port 3000 or describe by process.env.PORT
server.listen(port, () => {
    console.log(`Server running at ${port}`);
});

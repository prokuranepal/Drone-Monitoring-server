// it is used inorder to create the path towards the folder or file nice and readable
// it is available in core library.
const path = require('path');

const fs = require('fs');

const bodyparser = require('body-parser');
// it is used so that both socketIO and express can run simultaneously
// it is available in core library.
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname,'..','/public');

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

// to confirm the connection status with the client
io.on('connection', (socket) => {
    console.log('connected with the client');
    //var StartTime;
    app.get('/data' ,(req,res) => {
      //  var currentTime = new Date().getTime();

        socket.broadcast.emit('copter-data', req.query);
        res.send('data');
        //startTime = new Date().getTime();
       // var lastTime = new Date().getTime();
       // var totalTime = lastTime-currentTime;
       // console.log(`${totalTime} ms`);
    });

    /*app.post('/mission', (req,res) => {
        console.log(req.body);
        fs.writeFile('mission.json',JSON.stringify(req.body,undefined,2), (err) =>{
            if(err) {
                console.log(err);
            }
            console.log('saved');
        });
        res.send(req.body);
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

// it is used inorder to create the path towards the folder or file nice and readable
// it is available in core library.
const path = require('path');

// it is used so that both socketIO and express can run simultaneously
// it is available in core library.
const http = require('http');

// to use mysql
/*const mysql = require('mysql');*/

const express = require('express');
const socketIO = require('socket.io');
// mysql database
/*
const con = mysql.createConnection({
    host: 'localhost',
    database: 'swain_cordinates',
    user: 'swain',
    password: ''
});
*/

const publicPath = path.join(__dirname,'..','/public');

// setting the port at which the server run
const port = process.env.PORT || 3000;

// setting up express app
var app = express();

// created a http server to use express
var server = http.createServer(app);

// configuring server to use socket io
var io = socketIO(server);


// mysql database
/*
app.get('/data',(req,res) => {
    //data = req.query;
    con.connect( (err) => {
        if (err) throw err;
        var sql = "INSERT INTO location (Firmware) VALUES ('Company Inc')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    });

    res.send("hello");
    console.log(req.query);
});
*/




// setting up middleware at public directory which is displayed in browser in the main directory '/' file should be index.html
app.use(express.static(publicPath));

/*var data ;

app.get('/data', (req,res) => {
    var socket_id = [];
    data = req.query
   /!* io.on('connection', (socket) => {
        console.log('connected with the client');
        socket_id.push(socket.id);
        if (socket_id[0] === socket.id){
            io.removeAllListeners('connection');
        }

        socket.emit("copter-data" ,{
            data: data
        });

        socket.on('disconnect', () => {
            console.log('disconnected form the client');
        });
    });*!/
    res.send('hello');
});*/



// to confirm the connection status with the client
io.on('connection', (socket) => {
    console.log('connected with the client');

    app.get('/data' ,(req,res) => {

        io.emit('copter-data', req.query);
        res.send('data');
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

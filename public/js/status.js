let map,
    markerx = "undefined",
    StartOfFlight,
    prev_lat,
    prev_lng,
    armedCheck = 'TRUE',
    Home= {lat:parseFloat('27.686331'), lng:parseFloat('85.317652')},
    markers=[],
    flightPathCoordinate= [],
    dC=[],
    line1= [],
    line2= [],
    flightArray =[],
    flag1= 'False',
    socket,
    startTime;

if (location.pathname === "/default") {
    socket = io();
} else {
    socket = io(location.pathname,{
        transports: ['websocket']
    });
}

// on reconnection, reset the transports option, as the Websocket
// connection may have failed (caused by proxy, firewall, browser, ...)
socket.on('reconnect_attempt', () => {
    socket.io.opts.transports = ['polling', 'websocket'];
});

/**
 * to check connection status with the server
 */
socket.on('connect', function () {
    joinSocket(socket);
});

/**
 * to listens to the server socket and renders the data and map as required
 */
socket.on('copter-data', function (data) {

    let copterdata = copterData(data,0,armedCheck,prev_lat,prev_lng,flag1,markerx);
    StartOfFlight = copterdata.StartOfFlight;
    prev_lat = copterdata.prev_lat;
    prev_lng = copterdata.prev_lng;
    armedCheck = copterdata.armedCheck;
    flag1 = copterdata.flag1;
    markerx = copterdata.marker;
    this.map = copterdata.map;
});

/**
 * Socket to obtain the home loaction
 */
socket.on('homePosition', function (homeLocation) {
    Home = homePositionData(homeLocation);
});

/**
 * Socket to display the error message for 3 second in the
 * base to the website
 */
socket.on('error', function (msg)  {
    snackBar(msg.msg);
});

/**
 * to read mission from the companion computer
 */
socket.on('Mission',function (waypoints) {
    Home = missionWaypoints(waypoints);
});

/**
 * initmap update the map with the initial map google map.
 */
function initmap() {
   let data = initialMap(Home,map,markerx,1);
   map = data.map;
   markerx = data.marker;
}

/**
 * read mission from the pi
 */
function ReadMission() {
    readMission(socket);
}

/**
 * Below functions are made to check latency
 */
setInterval(function() {
    startTime = Date.now();
    socket.emit('ping');
}, 2000);

socket.on('pong',function () {
    let latency = (Date.now() - startTime);
    document.getElementById("Latency-data").innerHTML = latency + 'ms';
});
/*******************************/

/**
 * to check disconnect status
 */
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});
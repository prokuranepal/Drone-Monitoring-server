var map;
var i = 0;
var marker = "undefined";
var myLatLng = 0;
var previousImage;
var prev_lat;
var prev_lng;

var socket = io();

// to check connection status with the server
socket.on('connect', function () {
    console.log('connected successfully with the server');
});


// to listens to the server socket and renders the data and map as required
socket.on('copter-data', function (data) {

 //   var currentTime = new Date().getTime();
    
    var imageString;
    // Firmware data extraction from the data .
    var firmware = data.firm || 0;
    // the red and green gps pointer is defined according to the connection status.
    if ((data.conn).toUpperCase() === 'TRUE'){
        imageString = location.href+ "js/images/red.svg";
       // document.getElementById("conn-data").style.backgroundColor = "red";
    } else {
        imageString = location.href+ "js/images/green.svg";
        //document.getElementById("conn-data").style.backgroundColor = "green";
    }
    // Armed status is extracted.
    var is_armed = data.arm || 0;
    // EKF error is present or not.
    var is_ekf_ok = data.ekf || 0;
    // In which mode the copter is extracted.
    var mode = data.mode || 0;
    // Latitude of the copter location
    var _lat = parseFloat(data.lat) || 0;
    // Longitude of the copter location
    var _long = parseFloat(data.long) || 0;
    // Relative altitude form the home location
    var alt = parseFloat(data.alt) || 0;
    // Heading of the copter provide by the magnetometer.
    var heading = data.head || 0;
    // Altitude provide by the lidar.
    var lidar = data.lidar || 0 ;
    // Ground speed is extracted.
    var groundspeed = data.gs || 0;
    // Air Speed is extracted
    var airspeed = data.air || 0;
    // Roll
    var roll = data.roll || 0;
    // Pitch
    var pitch = data.pitch || 0;
    // Yaw
    var yaw = data.yaw || 0;
    // Error that is detected by the copter.
    var status = data.status || 0;
    // altr
    var altr = data.altr || 0;
    // voltage measured by the copter
    var volt = data.volt || 0;
    // velocity towards the x axis
    var vx = data.vx || 0;
    // velocity towards the y axis
    var vy = data.vy || 0;
    // velocity towards the z axis
    var vz = data.vz || 0;
    // heart beat
    var heartbeat = data.heartbeat || 0;
    // number of satellite the copter is connected with
    var numSat = data.numSat || 0;
    // Horizontal Dilution of Precision of the copter
    var hdop = data.hdop || 0;
    // what fix is provided by the copter 3D or 2D.
    var fix = data.fix || 0;

    // following document update the data in div of the html file
   // document.getElementById("firm-data").innerHTML = firmware;
    document.getElementById("mode-data").innerHTML = mode;
    document.getElementById("arm-data").innerHTML = is_armed;
    document.getElementById("ekf-data").innerHTML = is_ekf_ok;
    document.getElementById("status-data").innerHTML = status;
    document.getElementById("lidar-data").innerHTML = lidar;
    document.getElementById("volt-data").innerHTML = volt;
   // document.getElementById("heartbeat-data").innerHTML = heartbeat;

 //   document.getElementById("roll-data").innerHTML = roll;
  //  document.getElementById("pitch-data").innerHTML = pitch;
   // document.getElementById("yaw-data").innerHTML= yaw;
    document.getElementById("gs-data").innerHTML = groundspeed;
    document.getElementById("air-data").innerHTML = airspeed;
  //  document.getElementById("vx-data").innerHTML = vx;
  //  document.getElementById("vy-data").innerHTML = vy;
  //  document.getElementById("vz-data").innerHTML = vz;

    document.getElementById("altr-data").innerHTML = altr;
    document.getElementById("altitude-data").innerHTML = alt;
    document.getElementById("head-data").innerHTML = heading;
    document.getElementById("lat-data").innerHTML = _lat;
    document.getElementById("long-data").innerHTML = _long;
    document.getElementById("numSat-data").innerHTML = numSat;
    document.getElementById("hdop-data").innerHTML = hdop;
    document.getElementById("fix-data").innerHTML = fix;

    console.log(prev_lng,prev_lat);

    if (i >= 1) {
        var flightPath = new google.maps.Polyline({
            path: [
                {
                    lat: prev_lat,
                    lng: prev_lng
                },
                {
                    lat: _lat,
                    lng: _long
                }],
            geodesic: true,
            strokeColor: '#FFFF00',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        flightPath.setMap(map);
        console.log(i);
    }

    i = i + 1;
    prev_lat = _lat;
    prev_lng = _long;

    myLatLng = {lat: _lat, lng: _long};
    console.log(myLatLng);

    // marker is updated with the new gps position and other other parameters.
    if(marker !== "undefined") {

        var lastposition = marker.getPosition();
        marker.setPosition(myLatLng);
        marker.setIcon({
            url: imageString
        });

        $('img[src= "'+imageString+'"]').css({
            'transform': 'rotate(' + heading + 'deg)'
        });

        if(!map.getBounds().contains(marker.getPosition())) {
            map.panTo(myLatLng);
        }
        previousImage = imageString;
    }

   // var lastTime = new Date().getTime();
   // var totalTime = lastTime-currentTime;
   // console.log(`${totalTime} ms`);
});

// initmap update the map with the initial map google map.
function initmap() {

    /*Object.assign(document.getElementById("data").style, {
        color: "white",
        position: "absolute",
        float: "right",
        top: "0px",
        right: "0px",
        width: "300px",
        height: "150px"
    });*/

    var lat = {lat:27.67022157595957, lng:85.33891081809998};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: lat
    });
    map.setMapTypeId('satellite');
    map.setTilt(45);
    marker = new google.maps.Marker({
        position: lat,
        icon: {
           // path: '/images/green.jpg',
            url: location.href+ "js/images/green.svg",
            scale: 6,
            rotation: 0
        },
        map: map
    });
}

// to check disconnect status
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});
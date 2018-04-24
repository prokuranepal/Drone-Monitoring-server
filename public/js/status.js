let map;
let i = 0;
let marker = "undefined";
let previousImage;
let prev_lat;
let prev_lng;

/*var mydata = JSON.parse('../mission.json');
console.log(mydata);*/

const socket = io();

// to check connection status with the server
socket.on('connect', function () {
    console.log('connected successfully with the server');
});


// to listens to the server socket and renders the data and map as required
socket.on('copter-data', function (data) {

 //   var currentTime = new Date().getTime();

    let imageString;

    // the red and green gps pointer is defined according to the connection status.
    if (data.conn != undefined) {
        if ((data.conn).toUpperCase() === 'TRUE'){
            imageString = location.origin+ "/js/images/green.svg";
            console.log(imageString);
           // document.getElementById("conn-data").style.backgroundColor = "red";
        } else {
            imageString = location.origin+ "/js/images/red.svg";
            //document.getElementById("conn-data").style.backgroundColor = "green";
        }
    } else {
        imageString = location.origin+ "/js/images/red.svg";
    }
    // Armed status is extracted.
    let is_armed = data.arm || 0;
    // EKF error is present or not.
    let is_ekf_ok = data.ekf || 0;
    // In which mode the copter is extracted.
    let mode = data.mode || 0;
    // Latitude of the copter location
    let _lat = parseFloat(data.lat) || 0;
    // Longitude of the copter location
    let _long = parseFloat(data.long) || 0;
    // Relative altitude form the home location
    let alt = parseFloat(data.alt)*3.28084 || 0;
    // Heading of the copter provide by the magnetometer.
    let heading = data.head || 0;
    // Altitude provide by the lidar.
    let lidar = parseFloat(data.lidar)*3.28084 || 0 ;
    // Ground speed is extracted.
    let groundspeed = parseFloat(data.gs) || 0;
    // Air Speed is extracted
    let airspeed = data.air || 0;
    // Error that is detected by the copter.
    let status = data.status || 0;
    // altr
    let altr = parseFloat(data.altr)*3.28084 || 0;
    // voltage measured by the copter
    let volt = parseFloat(data.volt) || 0;
    // number of satellite the copter is connected with
    let numSat = data.numSat || 0;
    // Horizontal Dilution of Precision of the copter
    let hdop = parseFloat(data.hdop) || 100;
    // what fix is provided by the copter 3D or 2D.
    let fix = data.fix || 0;
    // heartbeat
    //let heartbeat = data.heartbeat || 0;

    // following document update the data in div of the html file
    document.getElementById("mode-data").innerHTML = mode;
    document.getElementById("arm-data").innerHTML = is_armed;
    document.getElementById("ekf-data").innerHTML = is_ekf_ok;
    document.getElementById("status-data").innerHTML = status;
    document.getElementById("lidar-data").innerHTML = lidar;
    document.getElementById("volt-data").innerHTML = volt;
    document.getElementById("gs-data").innerHTML = groundspeed;
    document.getElementById("air-data").innerHTML = airspeed;
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
        i = 2;
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
    }

    i = i + 1;
    prev_lat = _lat;
    prev_lng = _long;

    let myLatLng = {lat: _lat, lng: _long};
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
    let lat = {lat:27.682828, lng:85.321709};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 19,
        center: lat
    });
    map.setMapTypeId('satellite');
    map.setTilt(45);
    marker = new google.maps.Marker({
        position: lat,
        icon: {
            url: location.origin+ "/js/images/red.svg",
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
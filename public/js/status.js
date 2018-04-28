let map;
let i = 0;
let fix;
let marker = "undefined";
let prev_lat;
let prev_lng;
let myLatLng;

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
        } else {
            imageString = location.origin+ "/js/images/red.svg";
        }
    } else {
        imageString = location.origin+ "/js/images/red.svg";
    }
    // Armed status is extracted.
    let is_armed = data.arm || "False";
    // EKF error is present or not.
    let is_ekf_ok = data.ekf || "False";
    // In which mode the copter is extracted.
    let mode = data.mode || "Unknown";
    // Latitude of the copter location
    let _lat = parseFloat(data.lat) || 0;
    // Longitude of the copter location
    let _long = parseFloat(data.long) || 0;
    // Relative altitude form the home location
    let alt = parseFloat(data.alt)*3.28084 || 0;
    // Heading of the copter provide by the magnetometer.
    let heading = parseFloat(data.head) || 0;
    // Altitude provide by the lidar.
    let lidar = parseFloat(data.lidar)*3.28084 || 0 ;
    // Ground speed is extracted.
    let groundspeed = parseFloat(data.gs) || 0;
    // Air Speed is extracted
    let airspeed = data.air || 0;
    // Error that is detected by the copter.
    let status = data.status || "Unknown";
    // altr
    let altr = parseFloat(data.altr)*3.28084 || 0;
    // voltage measured by the copter
    let volt = parseFloat(data.volt) || 0;
    // number of satellite the copter is connected with
    let numSat = data.numSat || 0;
    // Horizontal Dilution of Precision of the copter
    let hdop = (parseFloat(data.hdop)/100) || 100;
    // what fix is provided by the copter 3D or 2D.
    if (data.fix === '2'){
        fix = "2D FIX";
    } else if (data.fix === '3'){
        fix = "3D FIX";
    } else {
        fix = "NO LOCK";
    }

    // heartbeat
    //let heartbeat = data.heartbeat || 0;

    // following document update the data in div of the html file
    document.getElementById("mode-data").innerHTML = mode;
    document.getElementById("arm-data").innerHTML = is_armed;
    document.getElementById("ekf-data").innerHTML = is_ekf_ok;
    document.getElementById("status-data").innerHTML = status;
    document.getElementById("lidar-data").innerHTML = lidar.toFixed(3);
    document.getElementById("volt-data").innerHTML = volt;
    document.getElementById("gs-data").innerHTML = groundspeed.toFixed(3);
    document.getElementById("air-data").innerHTML = airspeed.toFixed(3);
    document.getElementById("altr-data").innerHTML = altr.toFixed(3);
    document.getElementById("altitude-data").innerHTML = alt.toFixed(3);
    document.getElementById("head-data").innerHTML = heading;
    document.getElementById("lat-data").innerHTML = _lat.toFixed(6);
    document.getElementById("long-data").innerHTML = _long.toFixed(6);
    document.getElementById("numSat-data").innerHTML = numSat;
    document.getElementById("hdop-data").innerHTML = hdop;
    document.getElementById("fix-data").innerHTML = fix;

    if (i >= 1) {
        i = 2;
        lineDrawer(_lat,_long,prev_lat,prev_lng,'#FFFF00');
    }

    i = i + 1;
    prev_lat = _lat;
    prev_lng = _long;

    myLatLng = {lat: _lat, lng: _long};
    //console.log(myLatLng);

    if (i == 2 ) {
        console.log(myLatLng);
    }

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
    // socket.send(`send another data at ${new Date().getTime()}`);
});

function lineDrawer(presentLat,presentLng, pastLat, pastLng, color) {
    var flightPath = new google.maps.Polyline({
        path: [
            {
                lat: pastLat,
                lng: pastLng
            },
            {
                lat: presentLat,
                lng: presentLng
            }],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);
}

socket.on('waypoints', function (waypoint) {
    let a = 1;
    if (typeof (waypoint[a]) == 'undefined'){
        socket.send(`1`);
        console.log("1");
    } else {
        while (typeof (waypoint[a]) != 'undefined') {
            var marker1 = new google.maps.Marker({
                position: {lat: waypoint[a].lat, lng: waypoint[a].lon},
                map: map,
                label: `${a}`
            });
            if (a > 1) {
                lineDrawer(waypoint[a].lat,waypoint[a].lon,waypoint[a-1].lat,waypoint[a-1].lon,'#FF0000');
            }
            a = a +1;
        }
        socket.send(`0`);
    }
});

// initmap update the map with the initial map google map.
function initmap() {
    let lat = { lat:27.682828, lng:85.321709 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: lat,
        mapTypeId: 'satellite'
    });
    map.setTilt(45);
    marker = new google.maps.Marker ({
        position: lat,
        icon: {
            url: location.origin+ "/js/images/red.svg",
            scale: 6,
            rotation: 0
        },
        map: map
    });
}

function ReadMission() {
    var mission = fetch('/js/mission.txt')
        .then(response => response.json())
        .then(jsonResponse => {
            a= 1;
            while (typeof (jsonResponse[a]) != 'undefined') {
                var marker1 = new google.maps.Marker({
                    position: {lat: jsonResponse[a].lat, lng: jsonResponse[a].lon},
                    map: map,
                    label: `${a}`
                });
                if (a > 1) {
                    lineDrawer(jsonResponse[a].lat,jsonResponse[a].lon,jsonResponse[a-1].lat,jsonResponse[a-1].lon,'#FF0000');
                }
                a = a +1;
            }
        })

}

// to check disconnect status
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});
var map;
var i = 0;
var marker = "undefined";
var myLatLng = 0;


var socket = io();

// to check connection status with the server
socket.on('connect', function () {
    console.log('connected successfully with the server');
});

socket.on('copter-data', function (data) {
    // console.log(data);
    var firmware = data.firm || 0;
    if (data.conn === 'TRUE'){
        document.getElementById("conn-data").style.backgroundColor = "red";
    } else {
        document.getElementById("conn-data").style.backgroundColor = "yellow";
    }
    var is_armed = data.arm || 0;
    var is_ekf_ok = data.ekf || 0;
    var mode = data.mode || 0;
    var _lat = parseFloat(data.lat) || 0;
    var _long = parseFloat(data.long) || 0;
    var alt = parseFloat(data.alt) || 0;
    var heading = data.head || 0;
    var lidar = data.lidar || 0 ;
    var groundspeed = data.gs || 0;
    var roll = data.roll || 0;
    var pitch = data.pitch || 0;
    var yaw = data.yaw || 0;
    var status = data.status || 0;
    document.getElementById("firm-data").innerHTML = firmware;
    document.getElementById("mode-data").innerHTML = mode;
    document.getElementById("arm-data").innerHTML = is_armed;
    document.getElementById("ekf-data").innerHTML = is_ekf_ok;
    document.getElementById("status-data").innerHTML = status;
    document.getElementById("altitude-data").innerHTML = alt;
    document.getElementById("head-data").innerHTML = heading;
    document.getElementById("lidar-data").innerHTML = lidar;
    document.getElementById("gs-data").innerHTML = groundspeed;
    document.getElementById("roll-data").innerHTML = roll;
    document.getElementById("pitch-data").innerHTML = pitch;
    document.getElementById("yaw-data").innerHTML= yaw;
    document.getElementById("lat-data").innerHTML = _lat;
    document.getElementById("long-data").innerHTML = _long;
    myLatLng = {lat: _lat, lng: _long};
    console.log(myLatLng);
    console.log();
    if(marker !== "undefined") {
        marker.setPosition(myLatLng);
        if(!map.getBounds().contains(marker.getPosition())) {
            map.panTo(myLatLng);
        }

    }

});

function initmap() {
    var lat = {lat:27.67022157595957, lng:85.33891081809998};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: lat
    });
    map.setMapTypeId('hybrid');
    map.setTilt(45);
    marker = new google.maps.Marker({
        position: lat,
        map: map
    });
}

// to check disconnect status
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});
let map,
    marker = "undefined",
    StartOfFlight,
    prev_lat,
    prev_lng,
    armedCheck = 'True',
    Home= {lat:parseFloat('27.686331'), lng:parseFloat('85.317652')},
    markers=[],
    flightPathCoordinate= [],
    dC=[],
    line1= [],
    line2= [],
    flightArray =[],
    flag1= 'False';

const socket = io();

/**
 * to check connection status with the server
 */
socket.on('connect', function () {
    console.log('connected successfully with the server');
    socket.emit('joinWebsite');
});

/**
 * to listens to the server socket and renders the data and map as required
 */
socket.on('copter-data', function (data) {

    let imageString,
        is_armed = String(data.arm).toUpperCase() || "FALSE",
        _lat = parseFloat(data.lat) || 0,
        _lng = parseFloat(data.lng) || 0,
        heading = parseFloat(data.head) || 0,
        Sfix;

    /**
     * the red and green gps pointer is defined according to the connection status.
     */
    if (data.conn != undefined) {
        if ((data.conn).toUpperCase() === 'TRUE'){
            imageString = location.origin+ "/js/files/green.svg";
        } else {
            imageString = location.origin+ "/js/files/red.svg";
        }
    } else {
        imageString = location.origin+ "/js/files/red.svg";
    }

    if (is_armed == 'TRUE' && armedCheck == 'True') {
        StartOfFlight = new Date().getTime();
        armedCheck = 'False';
    }

    if (data.fix === 2){
        Sfix = "2D FIX";
    } else if (data.fix === 3){
        Sfix = "3D FIX";
    } else {
        Sfix = "NO FIX";
    }

    /**
     * following document update the data in div of the html file
     */
    document.getElementById("mode-data").innerHTML = data.mode;
    document.getElementById("arm-data").innerHTML = is_armed;
    document.getElementById("ekf-data").innerHTML = String(data.ekf).toUpperCase();
    document.getElementById("status-data").innerHTML = data.status;
    document.getElementById("lidar-data").innerHTML = (parseFloat(data.lidar)).toFixed(2);
    document.getElementById("volt-data").innerHTML = parseFloat(data.volt);
    document.getElementById("gs-data").innerHTML = (parseFloat(data.gs)).toFixed(2);
    document.getElementById("air-data").innerHTML = (parseFloat(data.as)).toFixed(2);
    document.getElementById("altr-data").innerHTML = (parseFloat(data.altr)).toFixed(2);
    document.getElementById("altitude-data").innerHTML = (parseFloat(data.alt)).toFixed(2);
    document.getElementById("head-data").innerHTML = heading;
    document.getElementById("lat-data").innerHTML = _lat.toFixed(7);
    document.getElementById("lng-data").innerHTML = _lng.toFixed(6);
    document.getElementById("numSat-data").innerHTML = data.numSat;
    document.getElementById("hdop-data").innerHTML = (parseFloat(data.hdop)/100);
    document.getElementById("fix-data").innerHTML = Sfix;
    document.getElementById("EST-data").innerHTML = timeConversion(parseFloat(data.est) * 1000);
    document.getElementById("DFH-data").innerHTML = distanceLatLng(Home.lat,Home.lng,_lat,_lng).toFixed(2);

    if (is_armed == 'TRUE') {
        document.getElementById("TOF-data").innerHTML = timeConversion(new Date().getTime()-StartOfFlight);
    } else {
        armedCheck = 'True';
    }

    if (flag1= 'True') {
        let pos = [
            {lat: _lat,lng: _lng},
            {lat: prev_lat,lng: prev_lng}
        ];
        addLine(pos,'#FFFF00');
    }

    flag1 = 'True';
    prev_lat = _lat;
    prev_lng = _lng;

   /* var infowindow = new google.maps.InfoWindow({
        content: "clicked"
    });

    map.addListener('click', function (e) {
        console.log(distanceLatLng(marker.getPosition().lat(),marker.getPosition().lng(),e.latLng.lat(),e.latLng.lng()));
        infowindow.open(distanceLatLng(Home.lat,Home.lng,e.latLng.lat(),e.latLng.lng()).toFixed(2),marker);
    });*/


    /**
     * marker is updated with the new gps position and other other parameters.
     */
    if(marker !== "undefined") {
        let myLatLng = {lat: _lat, lng: _lng};
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
    }
});

/**
 * Socket to obtain the home loaction
 */
socket.on('homePosition', function (homeLocation) {
    Home = {lat:parseFloat(homeLocation.lat),lng:parseFloat(homeLocation.lng)}
});

/**
 * Socket to display the error message for 3 second in the
 * base to the website
 */
socket.on('error', function (msg)  {
    var x = document.getElementById("snackbar");
    x.innerHTML = msg;
    x.className = "show";
    setTimeout(function() {
        x.className = x.className.replace("show", "");
    }, 3000);
});

/**
 * initmap update the map with the initial map google map.
 */
function initmap() {
    while(Home.lat == null);
    let pos = {lat:parseFloat(Home.lat), lng:parseFloat(Home.lng)};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: pos,
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        zoomControl: true,
        disableDoubleClickZoom: true,
        fullscreenControl : false,
        maxZoom:20,
        minZoom: 10,
        rotateControl: false,
        scaleControl: false
    });
    map.setTilt(45);
    marker = new google.maps.Marker ({
        position: pos,
        icon: {
            url: location.origin+ "/js/files/red.svg",
            scale: 6,
            rotation: 0
        },
        map: map
    });
}

/**
 * To add marker in the map
 * @param location [ latitude and longitude position to add marker]
 * @param label [ Name given to the marker]
 */
function addMarker(location,label) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        label: `${label}`,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: "#F00",
            fillOpacity: 1.0,
            strokeWeight: 0.4
        }
    });
    markers.push(marker);
}

/**
 * to delete the markers
 */
function deleteMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

/**
 * to delete the circles
 */
function deleteCircle() {
    for (let i=0;i<dC.length;i++){
        dC[i].setMap(null);
    }
    dC=[];
}

/**
 * to delete the flight paths
 */
function deleteFlightPath() {
    for (let i =0; i<flightArray.length; i++) {
        flightArray[i].setMap(null);
    }
    flightPathCoordinate = [];
    line1 =[];
    line2 =[];
}

/**
 * Clears the map
 * function to clear the previous marker and polyline
 */
function ClearMission() {
    deleteCircle();
    deleteFlightPath();
    deleteMarkers();
}

/**
 * to draw line between to latitude and longitude position
 * @param flightPathCoordinates [latitude and longitude object to draw the line]
 * @param color [color of the path]
 */
function addLine(flightPathCoordinates,color) {
    let flightPath = new google.maps.Polyline ({
        path: flightPathCoordinates,
        geodesic: true,
        clickable: false,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);
    flightArray.push(flightPath);
}

/**
 * to read mission from the companion computer
 */
socket.on('Mission',function (waypoints) {
    if (typeof (flightPathCoordinate[1]) == "undefined") {
        let a= 1;

        Home  = {lat : parseFloat(waypoints[0].lat),lng: parseFloat(waypoints[0].lng)};

        addMarker(Home,`H`);

        flightPathCoordinate.push(Home);

        while (typeof (waypoints[a]) != 'undefined') {

            let pos = {lat: parseFloat(waypoints[a].lat), lng: parseFloat(waypoints[a].lng)};

            // Ploting the marker in the map according to the position.
            addMarker(pos,a);

            // creating the array of pos for making the line with adjacent positions
            flightPathCoordinate.push(pos);
            a = a +1;
        }

        // creating the line with the adjacent position according to the flightPathCoordinate
        addLine(flightPathCoordinate,'#FF0000');
    }
});

/**
 * Download mission from the copter
 */
function ReadMission() {
    socket.emit('getMission','1');
}

/**
 * Download mission from the copter
 */
function DownloadMission() {
    socket.emit('getMission','1');
}

/**
 * To draw circle of radius provided by the user
 */
function DrawCircle() {
    deleteCircle();
    let radius = document.getElementById('data').value;
    for (let i = 1 ; i <= 10; i++) {
        let radius1 = radius*i,
            drawCircle = new google.maps.Circle({
                strokeColor: '#C0C0C0',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillOpacity: 0,
                map: map,
                center: Home,
                radius: radius1
            });
        dC.push(drawCircle);
    }
    DrawPlusLineFromCenter(Home.lat,Home.lng,radius*10);
}

/**
 * To draw plus line from the center
 * @param centerLat [ center Latitude ]
 * @param centerLng [ center Longitude ]
 * @param radius [ Radius to draw line ]
 */
function DrawPlusLineFromCenter(centerLat,centerLng,radius) {
    let angle =[0,90,180,270],
        north = destVincenty(centerLat,centerLng,angle[0],radius),
        south = destVincenty(centerLat,centerLng,angle[2],radius),
        east = destVincenty(centerLat,centerLng,angle[1],radius),
        west = destVincenty(centerLat,centerLng,angle[3],radius);

    line1.push(north);
    line1.push(south);
    addLine(line1,'#C0C0C0');
    line2.push(east);
    line2.push(west);
    addLine(line2,'#C0C0C0');
}

/**
 * to check disconnect status
 */
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});
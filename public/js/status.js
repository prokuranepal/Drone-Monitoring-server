let map;
let i = 0;
let marker = "undefined";
let StartOfFlight;
let prev_lat;
let prev_lng;
let myLatLng;
let armedCheck = 'True';
let flightPath;
let Home= {lat:-35.36326217651367, lng:149.1652374267578};
let markers=[];
let flightPathCoordinate= [];
let dC=[];
let line1= [];
let line2= [];



const socket = io();

// to check connection status with the server
socket.on('connect', function () {
    console.log('connected successfully with the server');
});

// to listens to the server socket and renders the data and map as required
socket.on('copter-data', function (data) {

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

    if (is_armed == 'True' && armedCheck == 'True') {
        StartOfFlight = new Date().getTime();
        armedCheck = 'False';
    }
    // Latitude of the copter location
    let _lat = parseFloat(data.lat) || 0;
    // Longitude of the copter location
    let _long = parseFloat(data.long) || 0;
    // Heading of the copter provide by the magnetometer.
    let heading = parseFloat(data.head) || 0;
    // what fix is provided by the copter 3D or 2D.
    let fix;
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
    document.getElementById("mode-data").innerHTML = data.mode;
    document.getElementById("arm-data").innerHTML = is_armed;
    document.getElementById("ekf-data").innerHTML = data.ekf;
    document.getElementById("status-data").innerHTML = data.status;
    document.getElementById("lidar-data").innerHTML = (parseFloat(data.lidar)*3.28084).toFixed(3);
    document.getElementById("volt-data").innerHTML = parseFloat(data.volt);
    document.getElementById("gs-data").innerHTML = (parseFloat(data.gs)).toFixed(3);
    document.getElementById("air-data").innerHTML = (parseFloat(data.as)).toFixed(3);
    document.getElementById("altr-data").innerHTML = (parseFloat(data.altr)*3.28084).toFixed(3);
    document.getElementById("altitude-data").innerHTML = (parseFloat(data.alt)*3.28084).toFixed(3);
    document.getElementById("head-data").innerHTML = heading;
    document.getElementById("lat-data").innerHTML = _lat.toFixed(7);
    document.getElementById("long-data").innerHTML = _long.toFixed(6);
    document.getElementById("numSat-data").innerHTML = data.numSat;
    document.getElementById("hdop-data").innerHTML = (parseFloat(data.hdop)/100);
    document.getElementById("fix-data").innerHTML = fix;
    document.getElementById("EST-data").innerHTML = timeConversion(parseFloat(data.est) * 1000);
    document.getElementById("DFH-data").innerHTML = distanceLatLng(Home.lat,Home.lng,_lat,_long).toFixed(3);

    if (is_armed == 'True') {
        document.getElementById("TOF-data").innerHTML = timeConversion(new Date().getTime()-StartOfFlight);
    } else {
        armedCheck = 'True';
    }

    if (i >= 1) {
        i = 2;
        lineDrawer(_lat,_long,prev_lat,prev_lng,'#FFFF00');
    }

    i = i + 1;
    prev_lat = _lat;
    prev_lng = _long;

    myLatLng = {lat: _lat, lng: _long};
    //console.log(myLatLng);

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
});

function timeConversion(millisec) {

    let seconds = math.floor((millisec / 1000)%60);

    let minutes = math.floor(millisec / (1000 * 60));

    return `${minutes}:${seconds}`;
}

// Distance calculate by using lat and lng
function distanceLatLng (lat1,lng1,lat2,lng2) {
    let earthRadius = 6378137; //meter
    let dLat = toRad(lat2-lat1);
    let dLng = toRad(lng2-lng1);
    let latt1 = toRad(lat1);
    let latt2 = toRad(lat2);
    let a = math.square(math.sin(dLat/2)) + math.square(math.sin(dLng/2))*math.cos(latt1)*math.cos(latt2);
    let c = 2 * math.atan2(math.sqrt(a),math.sqrt(1-a));
    return c*earthRadius;
}

// initmap update the map with the initial map google map.
function initmap() {
    //let lat = { lat:27.682828, lng:85.321709 };
    let lat = {lat:-35.36326217651367, lng:149.1652374267578};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: lat,
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        zoomControl: true
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

// to add the marker.
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

// to set the marker on the map
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// to delete the markers
function deleteMarkers() {
    setMapOnAll(null);
    markers = [];
}

// to draw the line according to the motion of the copter
function lineDrawer(presentLat,presentLng, pastLat, pastLng, color) {

    let pos = [
        {lat: presentLat,lng: presentLng},
        {lat: pastLat,lng: pastLng}
    ];

    addLine(pos,color);

}

// function to clear the previous marker and polyline
function ClearMission() {
    flightPath.setMap(null);
    flightPathCoordinate = [];
    line1 =[];
    line2 =[];
    for (i=0;i<dC.length;i++){
        dC[i].setMap(null);
    }
    dC=[];
    deleteMarkers();
}

// function to create the Line with fightPathcoordinates.
function addLine(flightPathCoordinates,color) {

    flightPath = new google.maps.Polyline ({
        path: flightPathCoordinates,
        geodesic: true,
        clickable: false,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    flightPath.setMap(map);
}

// To read the mission from the file.
function ReadMission() {
    // fetch is used for reading the mission from the file as json object.
    fetch('/js/mission.txt')
        .then(response => response.json())
        .then(jsonResponse => {

            if (typeof (flightPathCoordinate[1]) == "undefined") {
                let a= 1;

                Home  = {lat : jsonResponse[0].lat,lng: jsonResponse[0].lon};

                addMarker(Home,`H`);

                flightPathCoordinate.push(Home);

                while (typeof (jsonResponse[a]) != 'undefined') {

                    let pos = {lat: jsonResponse[a].lat, lng: jsonResponse[a].lon};

                    // Ploting the marker in the map according to the position.
                    addMarker(pos,a);

                    // creating the array of pos for making the line with adjacent positions
                    flightPathCoordinate.push(pos);
                    a = a +1;
                }

                /*let radiusq = [200,400,600,800];
                for (i = 0 ; i<radiusq.length ; i++) {
                    DrawCircle(Home,radiusq[i],map);
                }
*/


                // creating the line with the adjacent position according to the flightPathCoordinate
                addLine(flightPathCoordinate,'#FF0000');
            }

        })

}

// To Download the mission from the copter.
function DownloadMission() {
    socket.send(`1`);
}

/*// To draw the circle of given radius
function DrawCircle(center,radius,map) {
    let drawCircle = new google.maps.Circle({
        strokeColor: '#C0C0C0',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0,
        map: map,
        center: center,
        radius: radius
    });
    dC.push(drawCircle);
}*/

// To draw the circle of given radius
function DrawCircle1() {
    let radius = document.getElementById('data').value;
    for (let i = 1 ; i <= 10; i++) {
        radius1 = radius*i;
        let drawCircle = new google.maps.Circle({
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

function DrawPlusLineFromCenter(centerLat,centerLng,radius) {

    let angle =[0,90,180,270];

    let north = destVincenty(centerLat,centerLng,angle[0],radius);
    let south = destVincenty(centerLat,centerLng,angle[2],radius);
    line1.push(north);
    line1.push(south);
    addLine(line1,'#C0C0C0');

    let east = destVincenty(centerLat,centerLng,angle[1],radius);
    let west = destVincenty(centerLat,centerLng,angle[3],radius);
    line2.push(east);
    line2.push(west);
    addLine(line2,'#C0C0C0');

}

function toRad(n) {
    return n * Math.PI / 180;
};

function toDeg(n) {
    return n * 180 / Math.PI;
};

function destVincenty(lat1, lon1, brng, dist) {
    var a = 6378137,
        b = 6356752.3142,
        f = 1 / 298.257223563, // WGS-84 ellipsiod
        s = dist,
        alpha1 = toRad(brng),
        sinAlpha1 = Math.sin(alpha1),
        cosAlpha1 = Math.cos(alpha1),
        tanU1 = (1 - f) * Math.tan(toRad(lat1)),
        cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1,
        sigma1 = Math.atan2(tanU1, cosAlpha1),
        sinAlpha = cosU1 * sinAlpha1,
        cosSqAlpha = 1 - sinAlpha * sinAlpha,
        uSq = cosSqAlpha * (a * a - b * b) / (b * b),
        A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
        B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
        sigma = s / (b * A),
        sigmaP = 2 * Math.PI;
    while (Math.abs(sigma - sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2 * sigma1 + sigma),
            sinSigma = Math.sin(sigma),
            cosSigma = Math.cos(sigma),
            deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
    };
    var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1,
        lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)),
        lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1),
        C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha)),
        L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))),
        revAz = Math.atan2(sinAlpha, -tmp); // final bearing

    return {lat:toDeg(lat2), lng:lon1 + toDeg(L)};
};

// to check disconnect status
socket.on('disconnect', function () {
    console.log('disconneted from the server');
});
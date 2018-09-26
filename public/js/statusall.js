let map;
let StartOfFlight,
    markers=[],
    flightPathCoordinate= [],
    dC=[],
    line1= [],
    line2= [],
    flightArray =[];

let marker1 = "undefined",
    socket1,
    Home1 = {lat:parseFloat('28.370876'), lng:parseFloat('83.639491')},
    armedCheck1 = 'True',
    prev_lat1,
    prev_lng1,
    flag11 = 'False';

let marker2 = "undefined",
    socket2,
    Home2 = {lat:parseFloat('27.686592'), lng:parseFloat(' 85.317518')},
    armedCheck2 = 'True',
    prev_lat2,
    prev_lng2,
    flag12 = 'False';

let marker3 = "undefined",
    socket3,
    Home3 = {lat:parseFloat('26.809464'), lng:parseFloat('87.263660')},
    armedCheck3 = 'True',
    prev_lat3,
    prev_lng3,
    flag13 = 'False';

let marker4 = "undefined",
    socket4,
    Home4 = {lat:parseFloat('28.8120337'), lng:parseFloat('80.566447')},
    armedCheck4 = 'True',
    prev_lat4,
    prev_lng4,
    flag14 = 'False';

socket1 = io("/nangi");
socket2 = io("/pulchowk");
socket3 = io("/dharan");
socket4 = io("/dhangadi");
/**
 * to check connection status with the server
 */
socket1.on('connect', function () {
    joinSocket(socket1);
});
socket2.on('connect', function () {
    joinSocket(socket2);
});
socket3.on('connect', function () {
    joinSocket(socket3);
});
socket4.on('connect', function () {
    joinSocket(socket4);
});

/**
 * to listens to the server socket and renders the data and map as required
 */
socket1.on('copter-data', function (data) {

    let copterdata1 = copterData(data,2,armedCheck1,prev_lat1,prev_lng1,flag11,marker1);
    prev_lat1 = copterdata1.prev_lat;
    prev_lng1 = copterdata1.prev_lng;
    armedCheck1 = copterdata1.armedCheck;
    flag11 = copterdata1.flag1;
    marker1 = copterdata1.marker;
    this.map = copterdata1.map;
});

socket2.on('copter-data', function (data) {

    let copterdata2 = copterData(data,2,armedCheck2,prev_lat2,prev_lng2,flag12,marker2);
    prev_lat2 = copterdata2.prev_lat;
    prev_lng2 = copterdata2.prev_lng;
    armedCheck2 = copterdata2.armedCheck;
    flag12 = copterdata2.flag1;
    marker2 = copterdata2.marker;
    this.map = copterdata2.map;
});

socket3.on('copter-data', function (data) {

    let copterdata3 = copterData(data,2,armedCheck3,prev_lat3,prev_lng3,flag13,marker3);
    prev_lat3 = copterdata3.prev_lat;
    prev_lng3 = copterdata3.prev_lng;
    armedCheck3 = copterdata3.armedCheck;
    flag13 = copterdata3.flag1;
    marker3 = copterdata3.marker;
    this.map = copterdata3.map;
});

socket4.on('copter-data', function (data) {

    let copterdata4 = copterData(data,2,armedCheck4,prev_lat4,prev_lng4,flag14,marker4);
    prev_lat4 = copterdata4.prev_lat;
    prev_lng4 = copterdata4.prev_lng;
    armedCheck4 = copterdata4.armedCheck;
    flag14 = copterdata4.flag1;
    marker4 = copterdata4.marker;
    this.map = copterdata4.map;
});

/**
 * Socket to obtain the home loaction
 */
socket1.on('homePosition', function (homeLocation) {
    Home1 = homePositionData(homeLocation);
});

socket2.on('homePosition', function (homeLocation) {
    Home2 = homePositionData(homeLocation);
});

socket3.on('homePosition', function (homeLocation) {
    Home3 = homePositionData(homeLocation);
});

socket4.on('homePosition', function (homeLocation) {
    Home4 = homePositionData(homeLocation);
});

/**
 * initmap update the map with the initial map google map.
 */
function initmap() {

   let data1 = initialMap(Home1,this.map,marker1,1);
   marker1 = data1.marker;
   this.map = data1.map;

   let data2 = initialMap(Home2,this.map,marker2,2);
   marker2 = data2.marker;
   this.map = data2.map;


   let data3 = initialMap(Home3,this.map,marker3,2);
   marker3 = data3.marker;
   this.map = data3.map;

    let data4 = initialMap(Home4,this.map,marker4,2);
    marker4 = data4.marker;
    this.map = data4.map;

}

/**
 * to check disconnect status
 */
socket1.on('disconnect', function () {
    console.log('disconneted from the server');
});

socket2.on('disconnect', function () {
    console.log('disconneted from the server');
});

socket3.on('disconnect', function () {
    console.log('disconneted from the server');
});

socket4.on('disconnect', function () {
    console.log('disconneted from the server');
});

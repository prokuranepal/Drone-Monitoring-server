/**
 * require io
 */
const io = require('./socketInit');

/**
 * import mongoose to connect database
 * Database schema
 */
let {mongoose} = require('../db/mongoose');
let {DhangadiDroneData} = require('../models/droneData');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let lat4,
    lng4,
    Pi4 = [],
    Website4 = [],
    Android4 = [],
    deviceMission4,
    droneOnlineStatus4 = setTimeout(() => {},1000);

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * The path constant for required files
 */
const actualmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/missionDhangadi.txt'),
    renamedmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/oldmissionDhangadi.txt'),
    datafile = path.join(__dirname, '../..', '/public/dataDhangadi.txt');
/********************************************************************/

/**
 * Nangi namespace
 */
const dhangadi = io.of('/dhangadi');

dhangadi.on('connection', (socket) => {

    socket.on('joinPi', () => {
        Pi4.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi Dhangadi) connected`);
    });

    socket.on('joinAndroid', () => {
        Android4.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android Dhangadi) connected`);
    });

    socket.on('joinWebsite', () => {
        Website4.push(socket.id);
        socket.join('website');
        console.log(`${socket.id} (Website Dhangadi) connected`);
    });

    socket.on('success', (msg) => {
        dhangadi.to('android').emit('success',msg);
    });

    socket.on('data', (data) => {

        clearTimeout(droneOnlineStatus4);

        dhangadi.to('android').to('website').emit('copter-data', {
            lat: data.lat || 0,
            lng: data.lng || 0,
            altr: data.altr || 0,
            alt: data.alt || 0,
            numSat: data.numSat || 0,
            hdop: data.hdop || 0,
            fix: data.fix || 0,
            head: data.head || 0,
            gs: data.gs || 0,
            as: data.as || 0,
            mode: data.mode || "UNKNOWN",
            arm: data.arm || "FALSE",
            ekf: data.ekf || "FALSE",
            status: data.status || "UNKNOWN",
            lidar: data.lidar || 0,
            volt: data.volt || 0,
            est: data.est || 0,
            conn: data.conn || "FALSE"
        });
        lat4 = data.lat;
        lng4 = data.lng;
        let dhangadiDroneData = new DhangadiDroneData(data);
        dhangadiDroneData.save().then(() => {
            //console.log('data has been saved.');
        }, (e) => {
            console.log('data cannot be saved. : ' + e);
        });

        droneOnlineStatus4 = setTimeout(() => {
            dhangadi.to('website').emit('copter-data', {
                /**
                 * data format needed to send to the client when pi disconnect
                 */
                conn: 'False',
                fix: 0,
                numSat: 0,
                hdop: 10000,
                arm: 'False',
                head: 0,
                ekf: 'False',
                mode: 'UNKNOWN',
                status: 'UNKNOWN',
                volt: 0,
                gs: 0,
                as: 0,
                altr: 0,
                alt: 0,
                est: 0,
                lidar: 0,
                lat: lat4,
                lng: lng4
            });
            console.log(`${socket.id} (Pi Dhangadi) disconnected`);

            let fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            let db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                DhangadiDroneData.find({}, {
                    tokens: 0,
                    __id: 0,
                    _id: 0,
                    __v: 0
                }).cursor().on('data', function (doc) {
                    fileStream.write(doc.toString() + '\n');
                }).on('end', function () {
                    fileStream.end();
                    // check if collection exists and then dropped
                    db_native.listCollections({
                        name: 'dhangadidronedatas'
                    })
                        .next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                DhangadiDroneData.collection.drop();
                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        } , 6000);
    });

    socket.on('homePosition', (homeLocation) => {
        dhangadi.to('website').emit('homePosition', homeLocation);
    });

    socket.on('errors', (error) => {
        dhangadi.to('website').emit('error', error.msg);
        if (error.context === 'GPS/Mission') {
            fs.readFile(renamedmissionfile, (err, waypoints) => {
                if (err) {
                    return console.log('no mission file ');
                }
                dhangadi.to('website').emit('Mission', JSON.parse(waypoints));
            });
        } else if (error.context === 'Prearm') {
            dhangadi.to('android').emit('success', error.msg);
        } else if (error.context === 'Connection') {
            dhangadi.to('android').emit('success', error.msg);
        }
    });

    socket.on('waypoints', (waypoints) => {
        if (deviceMission4 == "android") {
            dhangadi.to('android').emit('Mission',waypoints);
        } else if (deviceMission4 == "website") {
            dhangadi.to('website').emit('Mission',waypoints);
        }
        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });

    socket.on('getMission', (data) => {
        deviceMission4 = JSON.parse(data).device;
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (!err) {
                console.log('rename done');
            }
            console.log('No actual mission file present');
        });
        dhangadi.to('pi').emit('mission_download', JSON.parse(data).mission);
    });

    socket.on('RTL', (rtl) => {
        dhangadi.to('pi').emit('RTL',rtl);
    });

    socket.on('LAND', (land) => {
        dhangadi.to('pi').emit('LAND',land);
    });

    socket.on('fly', (msg) => {
        dhangadi.to('pi').emit('initiate_flight', msg);
    });

    socket.on('error', (error) => {
        console.log('Socket error in dhangadi: '+ JSON.stringify(error,undefined,2));
    });

    socket.on('disconnect', () => {
        let indexWebsite4 = Website4.indexOf(socket.id),
            indexAndroid4 = Android4.indexOf(socket.id),
            indexPi4 = Pi4.indexOf(socket.id);

        if (indexWebsite4 > -1) {
            Website4.splice(indexWebsite4, 1);
            console.log(`${socket.id} (Website Nangi) disconnected`);
        }
        if (indexAndroid4 > -1) {
            Android4.splice(indexAndroid4, 1);
            console.log(`${socket.id} (Android device Nangi) disconnected`);
        }
        if (indexPi4 > -1) {
            Pi4.splice(indexPi4, 1);
            dhangadi.to('website').emit('copter-data', {
                /**
                 * data format needed to send to the client when pi disconnect
                 */
                conn: 'False',
                fix: 0,
                numSat: 0,
                hdop: 10000,
                arm: 'False',
                head: 0,
                ekf: 'False',
                mode: 'UNKNOWN',
                status: 'UNKNOWN',
                volt: 0,
                gs: 0,
                as: 0,
                altr: 0,
                alt: 0,
                est: 0,
                lidar: 0,
                lat: lat4,
                lng: lng4
            });
            console.log(`${socket.id} (Pi Dhangadi) disconnected`);

            let fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            let db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                DhangadiDroneData.find({}, {
                    tokens: 0,
                    __id: 0,
                    _id: 0,
                    __v: 0
                }).cursor().on('data', function (doc) {
                    fileStream.write(doc.toString() + '\n');
                }).on('end', function () {
                    fileStream.end();
                    // check if collection exists and then dropped
                    db_native.listCollections({
                        name: 'dhangadidronedatas'
                    })
                        .next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                DhangadiDroneData.collection.drop();
                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        }
    });

});
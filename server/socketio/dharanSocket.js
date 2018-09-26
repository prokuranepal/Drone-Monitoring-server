/**
 * require io
 */
const io = require('./socketInit');

/**
 * import mongoose to connect database
 * Database schema
 */
let {mongoose} = require('../db/mongoose');
let {DharanDroneData} = require('../models/droneData');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let lat3,
    lng3,
    Pi3 = [],
    Website3 = [],
    Android3 = [],
    deviceMission3;

/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * The path constant for required files
 */
const actualmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/missionDharan.txt'),
    renamedmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/oldmissionDharan.txt'),
    datafile = path.join(__dirname, '../..', '/public/dataDharan.txt');
/********************************************************************/

/**
 * Nangi namespace
 */
const dharan = io.of('/dharan');

dharan.on('connection', (socket) => {

    socket.on('joinPi', () => {
        Pi3.push(socket.id);
        socket.join('pi');
        console.log(`${socket.id} (Pi Dharan) connected`);
    });

    socket.on('joinAndroid', () => {
        Android3.push(socket.id);
        socket.join('android');
        console.log(`${socket.id} (Android Dharan) connected`);
    });

    socket.on('joinWebsite', () => {
        Website3.push(socket.id);
        socket.join('website');
        console.log(`${socket.id} (Website Dharan) connected`);
    });

    socket.on('success', (msg) => {
        dharan.to('android').emit('success',msg);
    });

    socket.on('data', (data) => {
        dharan.to('android').to('website').emit('copter-data', {
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
        lat3 = data.lat;
        lng3 = data.lng;
        let dharanDroneData = new DharanDroneData(data);
        dharanDroneData.save().then(() => {
            //console.log('data has been saved.');
        }, (e) => {
            console.log('data cannot be saved. : ' + e);
        });
    });

    socket.on('homePosition', (homeLocation) => {
        dharan.to('website').emit('homePosition', homeLocation);
    });

    socket.on('errors', (error) => {
        dharan.to('website').emit('error', error.msg);
        if (error.context === 'GPS/Mission') {
            fs.readFile(renamedmissionfile, (err, waypoints) => {
                if (err) {
                    return console.log('no mission file ');
                }
                dharan.to('website').emit('Mission', JSON.parse(waypoints));
            });
        } else if (error.context === 'Prearm') {
            dharan.to('android').emit('success', error.msg);
        } else if (error.context === 'Connection') {
            dharan.to('android').emit('success', error.msg);
        }
    });

    socket.on('waypoints', (waypoints) => {
        if (deviceMission3 == "android") {
            dharan.to('android').emit('Mission',waypoints);
        } else if (deviceMission3 == "website") {
            dharan.to('website').emit('Mission',waypoints);
        }
        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });

    socket.on('getMission', (data) => {
        deviceMission3 = JSON.parse(data).device;
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (!err) {
                console.log('rename done');
            }
            console.log('No actual mission file present');
        });
        dharan.to('pi').emit('mission_download', JSON.parse(data).mission);
    });

    socket.on('RTL', (rtl) => {
        dharan.to('pi').emit('RTL',rtl);
    });

    socket.on('LAND', (land) => {
        dharan.to('pi').emit('LAND',land);
    });

    socket.on('fly', (msg) => {
        dharan.to('pi').emit('initiate_flight', msg);
    });

    socket.on('disconnect', () => {
        let indexWebsite3 = Website3.indexOf(socket.id),
            indexAndroid3 = Android3.indexOf(socket.id),
            indexPi3 = Pi3.indexOf(socket.id);

        if (indexWebsite3 > -1) {
            Website3.splice(indexWebsite3, 1);
            console.log(`${socket.id} (Website Nangi) disconnected`);
        }
        if (indexAndroid3 > -1) {
            Android3.splice(indexAndroid3, 1);
            console.log(`${socket.id} (Android device Nangi) disconnected`);
        }
        if (indexPi3 > -1) {
            Pi3.splice(indexPi3, 1);
            dharan.to('website').emit('copter-data', {
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
                lat: lat3,
                lng: lng3
            });
            console.log(`${socket.id} (Pi Dharan) disconnected`);

            let fileStream = fs.createWriteStream(datafile);
            // access the mongodb native driver and its functions
            let db_native = mongoose.connection.db;
            fileStream.once('open', (no_need) => {
                DharanDroneData.find({}, {
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
                        name: 'dharandronedatas'
                    })
                        .next(function (err, collinfo) {
                            if (collinfo) {
                                // The collection exists
                                NangiDroneData.collection.drop();
                            }
                        });
                    console.log('********** the file has been written and db is dropped.');
                });
            });
        }
    });

});
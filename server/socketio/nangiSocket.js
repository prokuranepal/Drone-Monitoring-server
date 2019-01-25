/**
 * require io
 */
const io = require('./socketInit');

/**
 * import mongoose to connect database
 * Database schema
 */
let mongoose = require('../db/mongoose');
let {NangiDroneData} = require('../models/droneData');
let Client = require('../models/client');
let Count = require('../models/count');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let lat2,
    lng2,
    setTimeoutObject2= [];
/**
 * it is used in-order to create the path towards the folder or file nice and readable
 * it is available in core library.
 */
const path = require('path');

/**
 * The path constant for required files
 */
const actualmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/missionNangi.txt'),
    renamedmissionfile = path.join(__dirname, '../..', '/public/js/files/missions/oldmissionNangi.txt'),
    datafile = path.join(__dirname, '../..', '/public/data/nangi/');
/********************************************************************/

/**
 * Nangi namespace
 */
const nangi = io.of('/nangi');

nangi.on('connection', (socket) => {

    socket.on('joinPi', () => {
        let client = new Client({clientId: socket.id,deviceName: 'pi',socketName:'nangi'});
        client.save().catch((err) => console.log('Cannot create user of pi'));
        socket.join('pi');
        console.log(`${socket.id} (Pi Nangi) connected`);
    });

    socket.on('joinAndroid', () => {
        let client = new Client({clientId: socket.id, deviceName: 'android', socketName:'nangi'});
        client.save().catch((err) => console.log('Cannot create user of android'));
        socket.join('android');
        console.log(`${socket.id} (Android Nangi) connected`);
    });

    socket.on('joinWebsite', () => {
        let client = new Client({clientId: socket.id, deviceName: 'website',socketName:'nangi'});
        client.save().catch((err) => console.log('Cannot create user of website'));
        socket.join('website');
        console.log(`${socket.id} (Website Nangi) connected`);
    });

    socket.on('success', (msg) => {
        nangi.to('android').emit('success',msg);
    });

    socket.on('data', (data) => {
        let datas = {
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
        };

        nangi.to('android').to('website').emit('copter-data', datas);
        lat2 = data.lat;
        lng2 = data.lng;
        let nangiDroneData = new NangiDroneData(datas);
        nangiDroneData.save().catch((e) => console.log('data cannot be saved. : ' + e));
    });

    socket.on('homePosition', (homeLocation) => {
        nangi.to('website').emit('homePosition', homeLocation);
    });

    socket.on('errors', (error) => {
        nangi.to('website').to('android').emit('error', error);
        
    });

    socket.on('waypoints', (waypoints) => {
        Client.find({missionRequest: true,socketName:'nangi'},(err,data) => {
            if (err) {
                console.log('Cannot find user');
            }
            for (let id in data) {
                nangi.to(`${data[id].clientId}`).emit('Mission',waypoints);
                Client.update({clientId:data[id].clientId,socketName:'nangi'},{$set:{missionRequest:false}},(err,obj) => {
                    if(err) console.log('error while updating data');
                });
            }

        });
        fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
            if (err) {
                return console.log('File cannot be created');
            }
        });
    });

    socket.on('getMission', async (data) => {
        //data = {mission:1,device:devicename}
        await Client.updateOne({clientId:socket.id,socketName:'nangi'},{$set:{missionRequest : true}},(err,data)=> {
            if (err) {
                return console.log('Cannot update data');
            }
        });
        fs.rename(actualmissionfile, renamedmissionfile, (err) => {
            if (err) {
                console.log('No actual mission file present');
            } else {
                console.log('rename done');
            }
        });
        nangi.to('pi').emit('mission_download', JSON.parse(data).mission);
    });

    socket.on('RTL', (rtl) => {
        nangi.to('pi').emit('RTL',rtl);
    });

    socket.on('LAND', (land) => {
        nangi.to('pi').emit('LAND',land);
    });

    socket.on('fly', (msg) => {
        nangi.to('pi').emit('initiate_flight', msg);
    });

    socket.on('servo',(data) => {
        nangi.to('pi').emit('servo',data);
    });

    socket.on('positions', (data) => {
        nangi.to('pi').emit('positions',JSON.parse(data).file+'.txt');
    });

    socket.on('simulate',() => {
        Count.find({}).then(async (data) => {
            let fileNo = await data.nangiNo;
            fileNo = fileNo -1;
            fs.readFile(path.join(datafile, fileNo+'.txt'), (err, data) => {
                if (err) {
                    console.log('error in simulate readfile' + err);
                }
                let datas = data.toString();
                let splittedData = datas.split('}');
                for (let i = 0; i < splittedData.length - 1; i++) {
                    setTimeoutObject2.push(setTimeout(sendData2, 300 * (i + 1), nangi, splittedData[i] + '}'));
                }
            });
        });
    });

    socket.on('cancelSimulate', () => {
        for (let i= 0; i<setTimeoutObject2.length-1; i++){
            clearTimeout(setTimeoutObject2[i]);
        }
    });

    socket.on('error', (error) => {
        console.log('Socket error in nangi: '+ JSON.stringify(error,undefined,2));
    });

    socket.on('ping',() =>{
        socket.emit('pong');
    });

    socket.on('disconnect', () => {
        //we can know the reason of disconnect by adding variable in above function of listener
        Client.findOne({clientId:socket.id,socketName:'nangi'},async (err,data) => {
            if (err) {
                return console.log('Cannot find user');
            }
            var data1 = await data;
            Client.deleteOne({clientId :socket.id,socketName:'nangi'},(err,obj) => {
                if (err) {
                    return console.log('Cannot delete');
                }
            });
            if (data.deviceName === 'website'){
                console.log(`${socket.id} (Website Nangi) disconnected`);
            } else if(data.deviceName === 'android') {
                console.log(`${socket.id} (Android device Nangi) disconnected`);
            } else if(data.deviceName === 'pi') {
                Count.find({}).then(async (data) => {
                    var fileNo = await data[0].nangiNo;

                    nangi.to('website').emit('error','Drone disconnected from server');
                    nangi.to('website').emit('copter-data', {
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
                        lat: lat2 || 0,
                        lng: lng2 || 0
                    });

                    let fileStream = fs.createWriteStream(path.join(datafile ,fileNo+'.txt'));
                    // access the mongodb native driver and its functions
                    let db_native = mongoose.connection.db;
                    fileStream.once('open', (no_need) => {
                        NangiDroneData.find({}, {
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
                                name: 'nangidronedatas'
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

                    Count.updateOne({},{$set:{nangiNo: fileNo+1}},(err,obj) => {
                        if (err) console.log(err);
                    });

                },(err) => {
                    console.log(err);
                });
                console.log(`${socket.id} (Pi device Nangi) disconnected`);
            } else {
                console.log(`${socket.id} disconnected`);
            }
        });

    });

});

function sendData2(socket,data) {
    socket.emit('simulateData',data);
}
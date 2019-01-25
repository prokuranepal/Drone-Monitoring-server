/**
 * require io
 */
const io = require('./socketInit');

/**
 * import mongoose to connect database
 * Database schema
 */
let mongoose = require('../db/mongoose');
let {DharanDroneData} = require('../models/droneData');
let Client = require('../models/client');
let Count = require('../models/count');

/**
 * It is used for accessing the file to preform read,write and other file system operations
 */
const fs = require('fs');

/**
 * local variables
 */
let lat3,
    lng3,
    setTimeoutObject3=[];

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
    datafile = path.join(__dirname, '../..', '/public/data/dharan/');
/********************************************************************/

/**
 * Nangi namespace
 */
const dharan = io.of('/dharan');

dharan.on('connection', (socket) => {

    socket.on('joinPi', () => {
        let client = new Client({clientId: socket.id,deviceName: 'pi',socketName:'dharan'});
        client.save().catch((err) => console.log('Cannot create user of pi'));
        socket.join('pi');
        console.log(`${socket.id} (Pi Dharan) connected`);
    });

    socket.on('joinAndroid', () => {
        let client = new Client({clientId: socket.id, deviceName: 'android',socketName:'dharan'});
        client.save().catch((err) => console.log('Cannot create user of android'));
        socket.join('android');
        console.log(`${socket.id} (Android Dharan) connected`);
    });

    socket.on('joinWebsite', () => {
        let client = new Client({clientId: socket.id, deviceName: 'website',socketName:'dharan'});
        client.save().catch((err) => console.log('Cannot create user of website'));
        socket.join('website');
        console.log(`${socket.id} (Website Dharan) connected`);
    });

    socket.on('success', (msg) => {
        dharan.to('android').emit('success',msg);
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

        dharan.to('android').to('website').emit('copter-data', datas);
        lat3 = data.lat;
        lng3 = data.lng;
        let dharanDroneData = new DharanDroneData(datas);
        dharanDroneData.save().catch((e) => console.log('data cannot be saved. : ' + e));
    });

    socket.on('homePosition', (homeLocation) => {
        dharan.to('website').emit('homePosition', homeLocation);
    });

    socket.on('errors', (error) => {
        dharan.to('website').to('android').emit('error', error);
    });

    socket.on('waypoints', (waypoints) => {
        Client.find({missionRequest: true, socketName:'dharan'},(err,data) => {
            if (err) {
                console.log('Cannot find user');
            }
            for (let id in data) {
                dharan.to(`${data[id].clientId}`).emit('Mission',waypoints);
                Client.update({clientId:data[id].clientId, socketName:'dharan'},{$set:{missionRequest:false}},(err,obj) => {
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
        await Client.updateOne({clientId:socket.id, socketName: 'dharan'},{$set:{missionRequest : true}},(err,data)=> {
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

    socket.on('servo',(data) => {
        dharan.to('pi').emit('servo',data);
    });

    socket.on('positions', (data) => {
        dharan.to('pi').emit('positions',JSON.parse(data).file+'.txt');
    });

    socket.on('simulate',() => {
        Count.find({}).then(async (data) => {
            let fileNo = await data.dharanNo;
            fileNo = fileNo -1;
            fs.readFile(path.join(datafile, fileNo+'.txt'), (err, data) => {
                if (err) {
                    return console.log('error in simulate readfile' + err);
                }
                let datas = data.toString();
                let splittedData = datas.split('}');
                for (let i = 0; i < splittedData.length - 1; i++) {
                    setTimeoutObject3.push(setTimeout(sendData3, 300 * (i + 1), dharan, splittedData[i] + '}'));
                }
            });
        });
    });

    socket.on('cancelSimulate', () => {
        for (let i= 0; i<setTimeoutObject3.length-1; i++){
            clearTimeout(setTimeoutObject3[i]);
        }
    });

    socket.on('error', (error) => {
        console.log('Socket error in dharan: '+ JSON.stringify(error,undefined,2));
    });

    socket.on('ping',() =>{
        socket.emit('pong');
    });

    socket.on('disconnect', () => {
        //we can know the reason of disconnect by adding variable in above function of listener
        Client.findOne({clientId:socket.id,socketName: 'dharan'},async (err,data) => {
            if (err) {
                return console.log('Cannot find user');
            }
            var data1 = await data;
            Client.deleteOne({clientId :socket.id, socketName: 'dharan'},(err,obj) => {
                if (err) {
                    return console.log('Cannot delete');
                }
            });
            if (data.deviceName === 'website'){
                console.log(`${socket.id} (Website Dharan) disconnected`);
            } else if(data.deviceName === 'android') {
                console.log(`${socket.id} (Android device Dharan) disconnected`);
            } else if(data.deviceName === 'pi') {
                Count.find({}).then(async (data) => {
                    var fileNo = await data[0].dharanNo;

                    dharan.to('website').emit('error','Drone disconnected from server');
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
                        lat: lat3 || 0,
                        lng: lng3 || 0
                    });

                    let fileStream = fs.createWriteStream(path.join(datafile ,fileNo+'.txt'));
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
                                        DharanDroneData.collection.drop();
                                    }
                                });
                            console.log('********** the file has been written and db is dropped.');
                        });
                    });

                    Count.updateOne({},{$set:{dharanNo: fileNo+1}},(err,obj) => {
                        if (err) console.log(err);
                    });

                },(err) => {
                    console.log(err);
                });
                console.log(`${socket.id} (Pi device Dharan) disconnected`);
            } else {
                console.log(`${socket.id} disconnected`);
            }
        });
    });

});

function sendData3(socket,data) {
    socket.emit('simulateData',data);
}
module.exports =() => {
    /**
     * require io
     */
    const io = require('./socketInit');

    /**
     * import mongoose to connect database
     * Database schema
     */
    let mongoose = require('../db/mongoose');
    
    let {DroneData,DroneCount} = require('../models/droneData');
    /**
     * Imported client model to save and work with respect to connected client data.
     */
    let Client = require('../models/client');

    /**
     * It is used for accessing the file to preform read,write and other file system operations
     */
    const fs = require('fs');

    /**
     * local variables
     */
    let lat,
        lng,
        setTimeoutObject=[];

    /**
     * it is used in-order to create the path towards the folder or file nice and readable
     * it is available in core library.
     */
    const path = require('path');

    
    /********************************************************************/


    // mongoose.connection.on('open',() => {
    //     let db_native = mongoose.connection.db;
    //     db_native.listCollections({name: 'DroneCount'.toLowerCase()}).toArray(function (err, names) {
    //         if (err) {
    //             return console.log(err);
    //         }
    //         if (names.length === 0) {
    //             let count = new DroneCount({});
    //             count.save().catch((err) => {
    //                 return console.log(err);
    //             });
    //         }
    //     });
    // });

    /**
     * plane namespace
     */
    
    const plane = io.of(/^\/JT\d+/);

    // const plane = io.of(`/${planeName}`);

    /**
     * socket according to the namespace 
     * Every connected socket with a given namespace will execute the following 
     * functions
     * Socket listen to the 'connection' 
     */
    plane.on('connect', (socket) => {
        let planeName = socket.nsp.name.replace('/','');
        let drone_number;
        
        /**
         * The path constant for required files
         */
        const actualmissionfile = path.join(__dirname, '../..', `/public/js/files/missions/mission${planeName}.txt`),
        renamedmissionfile = path.join(__dirname, '../..', `/public/js/files/missions/oldmission${planeName}.txt`),
        datafile = path.join(__dirname, '../..', `/public/data/${planeName}/`);
        /**
         * socket 
         */
        socket.on('joinPi', () => {
            let client = new Client({clientId: socket.id,deviceName: 'pi',socketName: planeName});
            DroneCount.findOne({plane_name: planeName}).exec()
                .then((data) => {
                    if (data === null) {
                        let plane_count = new DroneCount({plane_name: planeName});
                        plane_count.save().catch((err) => console.log(`Cannot create plane count ${planeName}`));
                    }
                })
                .catch((err) => {
                    console.log(`Error in find one of palne count ${planeName}`)
                });

            client.save().catch((err) => console.log(`Cannot create user of pi joinPi socket ${planeName}`));
            socket.join('pi');
            drone_number = socket.id;
            console.log(`${socket.id} (Pi ${planeName}) connected`);
        });

        socket.on('joinAndroid', () => {
            let client = new Client({clientId: socket.id, deviceName: 'android',socketName: planeName});
            client.save().catch((err) => console.log(`Cannot create user of android joinAndroid socket ${planeName}`));
            socket.join('android');
            console.log(`${socket.id} (Android ${planeName}) connected`);
        });

        socket.on('joinWebsite', () => {
            let client = new Client({clientId: socket.id, deviceName: 'website',socketName: planeName});
            client.save().catch((err) => console.log(`Cannot create user of website joinWebsite socket ${planeName}`));
            socket.join('website');
            console.log(`${socket.id} (Website ${planeName}) connected`);
        });

        socket.on('success', (msg) => {
            plane.to('android').emit('success',msg);
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
                conn: data.conn || "FALSE",
                roll: data.roll || 0,
                pitch: data.pitch || 0,
                yaw: data.yaw || 0,
                plane_name: planeName,
                drone_number : drone_number
            };

            plane.to('android').to('website').emit('copter-data', datas);
            lat = data.lat;
            lng = data.lng;
            let drone_data = new DroneData(datas);
            drone_data.save().catch((err) => console.log(`data cannot be saved to database in socket data of plane ${planeName}`));
        });

        socket.on('homePosition', (homeLocation) => {
            plane.to('website').emit('homePosition', homeLocation);
        });

        socket.on('errors', (error) => {
            if (error.context === 'android'){
                plane.to('android').emit('error', error);
            } else if (error.context === 'website'){
                plane.to('website').emit('error', error);
            } else {
                plane.to('website').to('android').emit('error', error);
            }
        });

        socket.on('waypoints', (waypoints) => {
            Client.find({missionRequest: true, socketName: planeName}).exec()
                .then((data) => {
                    for (let id in data) {
                        plane.to(`${data[id].clientId}`).emit('Mission',waypoints);
                        Client.update({clientId: data[id].clientId, socketName: planeName},{$set:{missionRequest: false}}).exec()
                            .catch((err) => {
                                console.log(`error while updating data in waypoints socket of plane ${planeName}`);
                            });
                    }
                })
                .catch((err) => console.log(`Cannot find user wayponints socket ${planeName}`));
            fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
                if (err) {
                    return console.log(`File cannot be created in waypoints socket of plane ${planeName}`);
                }
            });
        });

        socket.on('getMission', (data) => {
            //data = {mission:1,device:devicename}
            Client.updateOne({clientId: socket.id, socketName: planeName},{$set:{missionRequest: true}}).exec()
                .then((updated)=> {
                    fs.rename(actualmissionfile, renamedmissionfile, (err) => {
                        if (err) {
                            console.log(`No actual mission file present in plane ${planeName}`);
                        } else {
                            console.log(`rename of mission file done in plane ${planeName}`);
                        }
                    });
                    plane.to('pi').emit('mission_download', JSON.parse(data).mission);
                })
                .catch((err) => console.log(`Cannot update data in getMission socket of plane ${planeName}`));
        });

        socket.on('RTL', (rtl) => {
            plane.to('pi').emit('RTL', rtl);
        });

        socket.on('LAND', (land) => {
            plane.to('pi').emit('LAND', land);
        });

        socket.on('fly', (msg) => {
            plane.to('pi').emit('initiate_flight', msg);
        });

        socket.on('servo', (data) => {
            plane.to('pi').emit('servo', data);
        });

        socket.on('magcal',() => {
            plane.to('pi').emit('magcal');
        });

        socket.on('positions', (data) => {
            plane.to('pi').emit('positions', JSON.parse(data).file+'.txt');
        });

        socket.on('simulate', () => {
            DroneCount.findOne({plane_name:planeName}).exec()
                .then((data) => {
                    let fileNo = data.count_value;
                    fileNo = fileNo -1;
                    fs.readFile(path.join(datafile, fileNo+'.txt'), (err, data) => {
                        if (err) {
                            return console.log(`error in simulate readfile simulate socket ${planeName}`);
                        }
                        let datas = data.toString();
                        let splittedData = datas.split('}');
                        for (let i = 0; i < splittedData.length - 1; i++) {
                            setTimeoutObject.push(setTimeout(sendData, 300 * (i + 1), plane, splittedData[i] + '}'));
                        }
                    });
                })
                .catch((err) => console.log(`Error in simulate socket of plane ${planeName}`));
        });

        socket.on('cancelSimulate', () => {
            for (let i= 0; i<setTimeoutObject.length-1; i++){
                clearTimeout(setTimeoutObject[i]);
            }
        });

        socket.on('error', (error) => {
            console.log(`Socket error in ${planeName}: `+ JSON.stringify(error,undefined,2));
        });

        socket.on('ping', () =>{
            socket.emit('pong');
        });

        socket.on('disconnect', () => {
            //we can know the reason of disconnect by adding variable in above function of listener
            Client.findOne({clientId: socket.id,socketName: planeName}).exec()
                .then((data) => {
                    Client.deleteOne({clientId: socket.id, socketName: planeName}).exec()
                        .catch((err) => {
                            console.log(`Cannot Delete the user of ${planeName} in disconnect socket`);
                        });
                    if (data.deviceName === 'website') {
                        console.log(`${socket.id} (Website ${planeName}) disconnected`);
                    } else if (data.deviceName === 'android') {
                        console.log(`${socket.id} (Android device ${planeName}) disconnected`);
                    } else if (data.deviceName === 'pi') {
                        console.log(`${socket.id} (Pi ${planeName}) disconnected`);
                        DroneCount.findOne({plane_name:planeName}).exec()
                            .then((data) => {
                                var fileNo = data.count_value;
                                plane.to('website').emit('error', {
                                    msg:`${planeName} disconnected from server`
                                });
                                plane.to('website').emit('copter-data', {
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
                                    lat: lat || 0,
                                    lng: lng || 0,
                                    roll: 0,
                                    pitch: 0,
                                    yaw: 0,
                                    plane_name: 'Unknown',
                                    drone_number : 'Unknwon'
                                });

                                let fileStream = fs.createWriteStream(path.join(datafile ,fileNo+'.txt'));
                                // access the mongodb native driver and its functions
                                let db_native = mongoose.connection.db;
                                fileStream.once('open', (no_need) => {
                                    DroneData.find({}, {
                                        tokens: 0,
                                        __id: 0,
                                        _id: 0,
                                        __v: 0
                                    }).cursor().on('data', function (doc) {
                                        fileStream.write(doc.toString() + '\n');
                                    }).on('end', function () {
                                        fileStream.end();
                                        // check if collection exists and then dropped
                                        db_native.listCollections({name: 'dronedatas'})
                                            .next(function (err, collinfo) {
                                                if (collinfo) {
                                                    // The collection exists
                                                    DroneData.collection.drop();
                                                }
                                            });
                                        console.log(`********** ${planeName} file has been written and db is dropped.`);
                                    });
                                });

                                DroneCount.updateOne({plane_name:planeName}, {$set:{count_value: fileNo+1}}).exec()
                                    .catch((err) => console.log(`Cannot update count value in socket disconnect of plane ${planeName}`));
                            })
                            .catch((err) => console.log(`Error in count find of ${planeName}`));
                    }
                })
                .catch((err) => console.log(`Error in find one of ${planeName}`));
        });
    });

    function sendData(socket,data) {
        socket.emit('simulateData',data);
    }
}
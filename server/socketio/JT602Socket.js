let work = require('./socketFunctions');

const planeName = 'JT602';
let {JT602DroneData,JT602Count} = require('../models/droneData');

const PlaneData = JT602DroneData;
const PlaneCount = JT602Count;
const DroneDatabaseName = `${planeName}dronedatas`.toLowerCase();

work(planeName,PlaneData,PlaneCount,DroneDatabaseName);
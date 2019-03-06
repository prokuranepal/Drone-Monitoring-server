let work = require('./socketFunctions');

const planeName = 'JT603';
let {JT603DroneData,JT603Count} = require('../models/droneData');

const PlaneData = JT603DroneData;
const PlaneCount = JT603Count;
const DroneDatabaseName = `${planeName}dronedatas`.toLowerCase();

work(planeName,PlaneData,PlaneCount,DroneDatabaseName);
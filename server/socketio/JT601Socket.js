let work = require('./socketFunctions');

const planeName = 'JT601';
let {JT601DroneData,JT601Count} = require('../models/droneData');

const PlaneData = JT601DroneData;
const PlaneCount = JT601Count;
const DroneDatabaseName = 'jt601dronedatas';

work(planeName,PlaneData,PlaneCount,DroneDatabaseName);
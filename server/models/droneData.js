const mongoose = require('mongoose');

const DroneSchema = new mongoose.Schema({}, {
	strict: false
});

const DroneCountSchema = new mongoose.Schema({
	plane_name : {
		type:String,
		required: true
	},
	count_value : {
		type: Number,
		required : true,
		default: 0
	}
});

const DroneData = mongoose.model("DroneData", DroneSchema);
const DroneCount = mongoose.model("DroneCount",DroneCountSchema);

module.exports.DroneData = DroneData;
module.exports.DroneCount = DroneCount;
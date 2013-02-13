var _ = require('lodash');
var mongoose = require('mongoose');
var db = mongoose.connect(process.env.MONGOLAB_URI || "mongodb://heroku_app11716489:ummbanfiojefmobsp8tiv7r4un@ds037997.mongolab.com:37997/heroku_app11716489");

//======================================
//      mongoose config
//======================================
module.exports.GPSDataSchema =  mongoose.Schema({
  time: { type: Date, default: Date.now },
  lat:  Number,
  lng:  Number,
  seqid: Number,
  type: String
});
module.exports.GPSData = mongoose.model('GPSData', module.exports.GPSDataSchema);

module.exports.GPSData.helper = _.extend(module.exports.GPSData.helper || {}, {
  record: function(data, seqid) {
    console.log('Got gps data :', data);
    data.seqid = seqid;
    var record = new GPSData(data).save(function(err){
      if(err) {
        console.log(err);
      }
    });
  },
  
  findAll: function(callback) {
    module.exports.GPSData.find().exec(function(err, data){
      if(err){
        callback({});
      } else {
        callback(data);
      }
    });
  }
});

module.exports.AccDataSchema =  mongoose.Schema({
  time: { type: Date, default: Date.now },
  x:  Number,
  y:  Number,
  z:  Number,
  seqid: Number,
  type: String
});
module.exports.AccData = mongoose.model('AccData', module.exports.AccDataSchema);

module.exports.AccData.helper = _.extend(module.exports.AccData.helper || {}, {
  record: function(data, seqid) {
    console.log('Got accelerometer data :', data);
    data.seqid = seqid;
    var record = new AccData(data).save(function(err){
      if(err) {
        console.log(err);
      }
    });
  },
  
  findAll: function(callback) {
    module.exports.AccData.find().exec(function(err, data){
      if(err){
        callback({});
      } else {
        callback(data);
      }
    });
  }
});

module.exports.lastSeqId = function(callback){
  module.exports.GPSData.findOne().sort('-seqid').exec(function(err, data) {
    if(err || !data) {
      callback(0);
    } else {
      callback(data.seqid);
    }
  });
}
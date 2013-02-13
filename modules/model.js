var _ = require('lodash');
var mongoose = require('mongoose');
var db = mongoose.connect(process.env.MONGOLAB_URI);

//======================================
//      mongoose config
//======================================
var GPSDataSchema = mongoose.Schema({
  time: { type: Date, default: Date.now },
  lat:  Number,
  lng:  Number,
  seqid: Number,
  type: String
});
var GPSData = mongoose.model('GPSData', GPSDataSchema);

GPSData.helper = _.extend(GPSData.helper || {}, {
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
    GPSData.find().exec(function(err, data){
      if(err){
        callback({});
      } else {
        callback(data);
      }
    });
  }
});

var AccDataSchema =  mongoose.Schema({
  time: { type: Date, default: Date.now },
  x:  Number,
  y:  Number,
  z:  Number,
  seqid: Number,
  type: String
});
var AccData = mongoose.model('AccData', AccDataSchema);

AccData.helper = _.extend(AccData.helper || {}, {
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
    AccData.find().exec(function(err, data){
      if(err){
        callback({});
      } else {
        callback(data);
      }
    });
  }
});

module.exports.GPSDataSchema = GPSDataSchema;
module.exports.GPSData = GPSData;
module.exports.AccDataSchema = AccDataSchema;
module.exports.AccData = AccData;

module.exports.lastSeqId = function(callback){
  GPSData.findOne().sort('-seqid').exec(function(err, data) {
    if(err || !data) {
      callback(0);
    } else {
      callback(data.seqid);
    }
  });
};
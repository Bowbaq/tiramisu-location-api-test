var model = require('./model');
var _ = require('lodash');
var num = require('numbers');
var json2csv = require('json2csv');

;(function Analyse(exports){
  var getData = function(callback) {
    raw = {};
    model.GPSData.helper.findAll(function(data){
      raw.gps = data;
      model.AccData.helper.findAll(function(data){
        raw.acc = data;
        callback(raw);
      });
    });
  };
  
  var toHist = function(data, key) {
    var hist = _.countBy(data[key], function(e){
      return Math.floor(e * 10) / 10;
    });
    
    return _.sortBy(_.map(hist, function(count, bin) {
      return {
        bin: +bin,
        count: count
      };
    }), function(e) {
      return e.bin;
    });
  };
  
  var chunkStdDev = function(key) {
    return function(chunk){
      var stdev = num.statistic.standardDev(_.pluck(chunk, key));
      return stdev;
    };
  };
  
  var chunkify = function(data) {
    var chunks = [];
    
    var current = [];
    current.push(data[0]);
    var start = new Date(data[0].time).getTime();
    
    for(var i = 1; i < data.length; i++) {
      var e = data[i];
      var diff = (new Date(e.time).getTime() - start) / 1000;
      
      current.push(e);
      
      if(diff > 10) {
        start = new Date(e.time).getTime();
        chunks.push(current);
        current = [];        
      }
    }
    
    return chunks;
  };
  
  var isOfType = function(type) {
    return function(e) {
      return e.type == type;
    };
  };
  
  var zeroIfNull = function(e) {
    return e == null || e == undefined ? 0 : e;
  };
  
  // 
  // var isOnBus = function(metrics) {
  //   var score = 0;
  //   var varsum = metrics.varx + metrics.vary + metrics.varz;
  //   
  //   if(varsum > 2 && varsum < 12) {
  //     score++;
  //   }
  //   
  //   return score > 0;
  // };
  // 
  // var analyse = function analyse(data){
  //   result = {
  //     acc: {},
  //     gps: {}
  //   };
  //   var acc = _.groupBy(data.acc, function(e){ return e.seqid; });    
  //   var gps = _.groupBy(data.gps, function(e){ return e.seqid; });
  //   _.forEach(acc, function(values, seqid){
  //     metrics = {};
  //     
  //     metrics.type = values[0].type;
  //           
  //     metrics.meanx = num.statistic.mean(_.map(_.pluck(values, 'x'), zeroIfNull));
  //     metrics.meany = num.statistic.mean(_.map(_.pluck(values, 'y'), zeroIfNull));
  //     metrics.meanz = num.statistic.mean(_.map(_.pluck(values, 'z'), zeroIfNull));
  //     
  //     metrics.varx = num.statistic.standardDev(_.map(_.pluck(values, 'x'), zeroIfNull));
  //     metrics.vary = num.statistic.standardDev(_.map(_.pluck(values, 'y'), zeroIfNull));
  //     metrics.varz = num.statistic.standardDev(_.map(_.pluck(values, 'z'), zeroIfNull));
  //     
  //     metrics.minx = Math.min.apply(null, _.map(_.pluck(values, 'x'), zeroIfNull));
  //     metrics.miny = Math.min.apply(null, _.map(_.pluck(values, 'y'), zeroIfNull));
  //     metrics.minz = Math.min.apply(null, _.map(_.pluck(values, 'z'), zeroIfNull));
  //     
  //     metrics.maxx = Math.max.apply(null, _.map(_.pluck(values, 'x'), zeroIfNull));
  //     metrics.maxy = Math.max.apply(null, _.map(_.pluck(values, 'y'), zeroIfNull));
  //     metrics.maxz = Math.max.apply(null, _.map(_.pluck(values, 'z'), zeroIfNull));
  //     
  //     metrics.isOnBus = isOnBus(metrics);
  // 
  //     result.acc[seqid] = metrics;
  //   });
  //   
  //   return result;
  // };
  
  exports.accdist = function accdist(req, res){
    getData(function(data){
      var acc = _.filter(data.acc, isOfType(req.params.type));      
      var chunks = chunkify(acc);
      
      stddevs = {
        x: _.map(chunks, chunkStdDev('x')),
        y: _.map(chunks, chunkStdDev('y')),
        z: _.map(chunks, chunkStdDev('z'))
      };
                  
      res.send({
        x: toHist(stddevs, 'x'),
        y: toHist(stddevs, 'y'),
        z: toHist(stddevs, 'z')
      });
    });
  };
  
  exports.csvacc = function csvacc(req, res){
    model.AccData.helper.findAll(function(data){
      json2csv({data: data, fields: ['seqid', 'x', 'y', 'z', 'time', 'type']}, function(csv) {
        res.set('Content-Type', 'text/plain');
        res.send(csv);
      });
    });
  };
  
  exports.csvgps = function csvgps(req, res){
    model.GPSData.helper.findAll(function(data){
      json2csv({data: data, fields: ['seqid', 'lat', 'lng', 'speed', 'time', 'type']}, function(csv) {
        res.set('Content-Type', 'text/plain');
        res.send(csv);
      });
    });
  };
  
  
})(module.exports);
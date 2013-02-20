var model = require('./model');
var _ = require('lodash');
var num = require('numbers');
var json2csv = require('json2csv');

;(function Analyse(exports){
  
  var zeroIfNull = function(e) {
    return e == null || e == undefined ? 0 : e;
  };
  
  var analyse = function analyse(data){
    result = {
      acc: [],
      gps: []
    };
    var acc = _.groupBy(data.gps, function(e){ return e.seqid; });    
    var gps = _.groupBy(data.acc, function(e){ return e.seqid; });
    _.forEach(acc, function(values){
      metrics = {};
      
      metrics.meanx = num.statistic.mean(_.map(_.pluck(values, 'x'), zeroIfNull));
      metrics.meany = num.statistic.mean(_.map(_.pluck(values, 'y'), zeroIfNull));
      metrics.meanz = num.statistic.mean(_.map(_.pluck(values, 'z'), zeroIfNull));
      
      metrics.varx = num.statistic.standardDev(_.map(_.pluck(values, 'x'), zeroIfNull));
      metrics.vary = num.statistic.standardDev(_.map(_.pluck(values, 'y'), zeroIfNull));
      metrics.varz = num.statistic.standardDev(_.map(_.pluck(values, 'z'), zeroIfNull));
      
      metrics.minx = Math.min.apply(null, _.map(_.pluck(values, 'x'), zeroIfNull));
      metrics.miny = Math.min.apply(null, _.map(_.pluck(values, 'y'), zeroIfNull));
      metrics.minz = Math.min.apply(null, _.map(_.pluck(values, 'z'), zeroIfNull));
      
      metrics.maxx = Math.max.apply(null, _.map(_.pluck(values, 'x'), zeroIfNull));
      metrics.maxy = Math.max.apply(null, _.map(_.pluck(values, 'y'), zeroIfNull));
      metrics.maxz = Math.max.apply(null, _.map(_.pluck(values, 'z'), zeroIfNull));

      result.acc.append(metrics);
    });
    
    return result;
  };
  
  exports.show = function show(req, res){
    raw = {};
    result = {};
    model.GPSData.helper.findAll(function(data){
      raw.gps = data;
      model.AccData.helper.findAll(function(data){
        raw.acc = data;
        result = analyse(raw);
        res.send(result);
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
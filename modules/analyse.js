var model = require('./model');

;(function Analyse(exports){
  exports.show = function show(req, res){
    model.GPSData.helper.findAll(res.send);
    model.AccData.helper.findAll(res.send);
  };
})(module.exports);
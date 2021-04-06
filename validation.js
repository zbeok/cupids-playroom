const ipfilter = require('express-ipfilter').IpFilter

var DataBase = require("./database.js");
var db = new DataBase(".data/validation.json",{blocked:[]});

class Validator {
  constructor() {
  }
  
  client_ip(req, res) {
    return req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for']).split(',')[0] : ""
  }
  
  ip_check(ip){
    if (db.get('blocked',{ip:ip})!=null) {
      return false;
    }
    return true;
  }
  
  add_ip(ip){
    if (this.ip_check(ip)) {
      var ip = db.new('blocked',{ip:ip});
    }
  }
  
  delete_ip(ip) {
    db.delete('users',{ip:ip});
  }
  
  all_ips() {
    var ips = db.all('blocked');
    var result = []
    for (var i in ips) {
      var ip_item = ips[i];
      result.push(ip_item['ip']);
    }
    return result;
  }
  
  static nuke() {
    db.nuke('blocked');
  }
  
}

module.exports = Validator;
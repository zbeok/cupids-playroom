const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Bow = require("./schema/Bow");
const User = require("./schema/User");
const Letter = require("./schema/Letter");

class DataBase {
  constructor (author,text) {
    const adapter = new FileSync('.data/db.json')
    this._db = low(adapter)
    this._db.defaults({ bows: [], 
                 users: []
      }).write();
    
  }
  
  new(category,data) {
    var item = this.db
      .get(category)
      .push(data)
      .write();
    return item[0];   
  }
  get(category,data) {
    var item = this.db
      .get(category)
      .find(data)
      .value();
    return item;   
  }
  
  update(category,criteria,data) {
    var item = this.db
      .get(category)
      .find(criteria)
      .assign(data)
      .write();
    return item;
  }
  
  delete(category,criteria) {
    var item = db.get('posts')
    .remove(criteria)
    .write()
  }
  
  nuke_users() {
    console.log("User data cleared")
    db.get('users')
    .remove()
    .write()
  }
  
  nuke_bows() {
    console.log("User data cleared")
    db.get('bows')
    .remove()
    .write()
  }
  
  nuke() {
    this.nuke_users();
    this.nuke_bows();
  }
}

module.exports = Database;
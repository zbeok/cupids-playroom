const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

class DataBase {
  
  constructor () {
    const adapter = new FileSync('.data/db.json')
    this._db = low(adapter)
    this._db.defaults({ bows: [], 
                 users: []
      }).write();
    
  }
  
  new(category,data) {
    var item = this._db
      .get(category)
      .push(data)
      .write();
    if (item==null)
      return  null;
    return item[0];   
  }
  
  get(category,data) {
    var item = this._db
      .get(category)
      .find(data)
      .value();
    return item;   
  }
  
  update(category,criteria,data) {
    var item = this._db
      .get(category)
      .find(criteria)
      .assign(data)
      .write();
    return item;
  }
  
  delete(category,criteria) {
    var item = this._db.get('posts')
    .remove(criteria)
    .write()
  }
  
  nuke_users() {
    console.log("User data cleared")
    this._db.get('users')
    .remove()
    .write()
  }
  
  nuke_bows() {
    console.log("User data cleared")
    this._db.get('bows')
    .remove()
    .write()
  }
  
  nuke() {
    this.nuke_users();
    this.nuke_bows();
  }
}

module.exports = DataBase;
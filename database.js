const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

class DataBase {
  constructor() {
    const adapter = new FileSync(".data/db.json",{
      defaultValue: { bows: [], users: [], letters: [] }
    });
    this._db = low(adapter);
    // this._db.defaults().write();
    this._db.read();
  }
  
  new(category, data) {
    var item = this._db
      .get(category)
      .push(data)
      .write();
    if (item == null) return null;
    return item[0];
  }

  get(category, data) {
    var item = this._db
      .get(category)
      .find(data)
      .value();
    return item;
  }
  
  get_all(category, data) {
    var items = this._db
      .get(category)
      .filter(data)
      .value();
    return items;
  }
  
  all(category=null) {
    if (category==null) {
      var db_state = this._db.getState().value();
      return db_state;
    }
    var list = this._db
      .get(category)
      .value();
    return list;
  }

  update(category, criteria, data) {
    this._db.read();
    var item = this._db
      .get(category)
      .find(criteria)
      .assign(data)
      .write();
    return item;
  }

  delete(category, criteria) {
    this._db.read();
    var item = this._db
      .get(category)
      .remove(criteria)
      .write();
  }
  
  size(category) {
    var length = this._db.get(category)
      .size()
      .value();
    return length;
  }
  
  nuke(category) {
    console.log(category+" data cleared");
    this._db.read();
    this._db
      .get(category)
      .remove()
      .write();
  }
}

module.exports = DataBase;

var uuid = require("uuid");
var DataBase = require("../database.js");
var db = new DataBase();

class User {
  constructor (pseudonym="") {
    this.id = null;
    this.token = null;
    this.pseudonym = pseudonym;
    this.letters = {};
    this.uuid = uuid.v4();
  }
  
  static reconstruct(obj) {
    var empty = new User();
    return Object.assign(empty, obj);
  }
  
  static find(uuid) {
    var user = db.get('users',{uuid:uuid});
    if (user==null) {
      return null;
    }
    
    user = User.reconstruct(user);
    
    return user;
  }
  
  add_letter(letter){
    this.letters[letter.uuid] = letter;
    this.save();
  }
  add_token(token) {
    this.token = token;
    var item = this.save();
  }
  
  add_id(id) {
    if (this.id!=null) {
      return null;
    }
    this.id = id;
    var item = this.save();
  }
  
  init(){
    var new_user = db.new('users',this);
    new_user = User.reconstruct(this);
    return new_user;
  }
  
  
  save(){
    var item = db.update('users',{uuid:this.uuid},this);
    item = User.reconstruct(this);
    return item;
  }
  
  delete() {
    var item = db.delete('users',{uuid:this.uuid});
    item = User.reconstruct(this);
    return item;
  }
  
}
User.db = db;
module.exports = User;
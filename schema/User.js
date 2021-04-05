var uuid = require("uuid");
var DataBase = require("../database.js");
var db = new DataBase();

class User {
  constructor () {
    this.id = null;
    this.username = null;
    this.token = null;
    this.letters = {};
    this.deliveries = {};
    this.uuid = uuid.v4();
  }
  
  static reconstruct(obj) {
    var empty = new User();
    return Object.assign(empty, obj);
  }
  
  static find(uuid) {
    if (uuid==null) {
      return null;
    }
    var user = db.get('users',{uuid:uuid});
    if (user==null) {
      return null;
    }
    user = User.reconstruct(user);
    return user;
  }
  static find_id(id) {
    var user = db.get('users',{id:id});
    if (user==null) {
      return null;
    }
    user = User.reconstruct(user);
    return user;
  }
  
  static random() {    
    var users = db.all('users');
    if (users==null) {
      return null;
    }
    
    const i = Math.floor(Math.random() * db.size());
    return user[i];
  }
  
  add_delivery(letter){
    this.delivery[letter.uuid] = letter.text;
    this.save();
  }
  
  add_letter(letter){
    this.letters[letter.uuid] = letter.text;
    this.save();
  }
  
  delete_delivery(letter){
    this.deliveries.delete(letter.uuid);
    this.save();
  }
  
  delete_letter(letter){
    this.letters.delete(letter.uuid);
    this.save();
  }
  
  add_token(token) {
    this.token = token;
    this.save();
  }
  
  add_id(id) {
    if (this.id!=null) {
      return null;
    }
    this.id = id;
    this.save();
  }
  
  add_username(username) {
    if (this.username!=null) {
      return null;
    }
    this.username = username;
    this.save();
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
  
  static all() {
    var users = db.all('users');
    return users;
  }
  
  static nuke() {
    db.nuke('users');
  }
  
}
User.db = db;
module.exports = User;
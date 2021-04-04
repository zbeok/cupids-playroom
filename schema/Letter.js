var uuid = require("uuid");
var DataBase = require("../database.js");
var db = new DataBase();

class Letter {
  constructor (author_uuid,pseudonym,text) {
    this.author_uuid = author_uuid;
    this.text = text;
    this.pseudonym = pseudonym;
    this.recipient = null;
    this.approved = false;
    this.uuid = uuid.v4();
  }
  
  static reconstruct(obj) {
    var empty = new Letter();
    return Object.assign(empty, obj);
  }
  
  to(recipient) {
    if (this.approved)
      this.recipient=recipient;
    this.save();
  }
  
  approve() {
    this.approved = true;
    this.save();
  }
  
  static find(uuid) {
    var letter = db.get('letters',{uuid:uuid});
    if (letter==null) {
      return null;
    }
    letter = Letter.reconstruct(letter);
    return letter;
  }
  
  init(){
    var letter = db.new('letters',this);
    letter = Letter.reconstruct(this);
    return letter;
  }
  
  save(){
    var item = db.update('letters',{uuid:this.uuid},this);
    item = Letter.reconstruct(this);
    return item;
  }
  
  delete() {
    var item = db.delete('letters',{uuid:this.uuid});
    item = Letter.reconstruct(this);
    return item;
  }
  
}

module.exports = Letter;
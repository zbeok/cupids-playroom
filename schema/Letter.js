var uuid = require("uuid");
var DataBase = require("../database.js");
var db = new DataBase();

class Letter {
  constructor (author=null,pseudonym=null,text=null) {
    if (text==null) {
      return;
    }
    this.author = author.uuid;
    this.text = text;
    this.pseudonym = pseudonym;
    this.recipient = null;
    this.approved = null;
    this.bow = null;
    this.uuid = uuid.v4();
  }
  
  static reconstruct(obj) {
    var empty = new Letter();
    return Object.assign(empty, obj);
  }
  
  to(recipient) {
    if (this.approved)
      this.recipient=recipient.uuid;
    this.save();
  }
  
  burn() {
    this.recipient = null;
    this.save();
  }
  
  approve(state=true) {
    this.approved = state;
    this.save();
  }
  
  claim(bow) {
    this.bow = bow.guild;
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
  
  static find_unprocessed() {
    var letters_raw = db.get_all('letters',{approved:null,bow:null});
    var letters = [];
    for (var i in letters_raw) {
      var letter = Letter.reconstruct(letters_raw[i]);
      
      letters.push(letter);
    }
    return letters;
  }
  
  static find_by_persons(user0,user1) {
    var letter = db.get('letters',{author:user0.uuid,recipient:user1.uuid});
    if (letter==null) {
      letter = db.get('letters',{author:user1.uuid,recipient:user0.uuid});
      if (letter==null) {
        return null;
      }
    }
    letter = Letter.reconstruct(letter);
    return letter;
  }
  
  static all() {
    var letters = db.all('letters');
    return letters;
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
  static nuke() {
    db.nuke('letters');
  }
  
}

module.exports = Letter;
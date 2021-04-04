var DataBase = require("../database.js");
var db = new DataBase();

class Bow {
  constructor(msg) {
    this.guild = msg.guildID
    this.channel = msg.channel;
    this.host = msg.author;
    this.delimiter = "|";
    this.letters = {};
    this.limit = 30;
  }
  
  add_letter(letter){
    if (this.letters.length>this.limit){
      console.log("TODO: make a limit. bows need to distribute letters evenly");
    }
    this.letters.push(letter.uuid);
    this.save();
  }
  
  remove_letter(letter) {
    var i = this.letters.indexOf(letter.uuid);
    this.letters.splice(0,i);
    this.save();
  }
  
  static reconstruct(obj) {
    var empty = new Bow();
    return Object.assign(empty, obj);
  }
  
  static find(guild) {
    var bow = db.get('bows',{guild:guild});
    if (bow==null) {
      return null;
    }
    bow = Bow.reconstruct(bow);
    return bow;
  }
  
  //TODO make an actual random finder
  static random() {
    var bow = db.get('bows').value();
    if (bow==null) {
      return null;
    }
    bow = Bow.reconstruct(bow[0]);
    return bow;
  }
  
  init(){
    var bow = db.new('bows',this);
    bow = Bow.reconstruct(this);
    return bow;
  }
  
  save(){
    var item = db.update('bows',{guild:this.guild},this);
    item = Bow.reconstruct(this);
    return item;
  }
  
  delete() {
    var item = db.delete('bows',{guild:this.guild});
    item = Bow.reconstruct(this);
    return item;
  }
  
}

module.exports = Bow;
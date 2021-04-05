var DataBase = require("../database.js");
var db = new DataBase();

class Bow {
  constructor(msg=null) {
    if (msg==null) {
      return;
    }
    this.guild = msg.guildID;
    this.channel = msg.channel;
    this.host = msg.author;
    this.delimiter = "|";
    this.queue = [];
    this.limit = 30;
  }
  
  add_letter(letter){
    if (letter==null) {
      console.log("ERROR tf");
      return;
    }
    if (this.queue.length>this.limit){
      console.log("TODO: make a limit. bows need to distribute letters evenly");
      console.log(this.queue);
    }
    this.queue.push(letter.uuid);
    this.save();
  }
  
  remove_letter(letter) {
    var i = this.queue.indexOf(letter.uuid);
    this.queue.splice(0,i);
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
    var bows = db.all('bows');
    if (bows.length==0) {
      return null;
    }
    var bow = Bow.reconstruct(bows[0]);
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
  
  static all() {
    var bows = db.all('bows');
    return bows;
  }
  
  static nuke() {
    db.nuke('bows');
  }
  
}

module.exports = Bow;
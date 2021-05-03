var uuid = require("uuid");
var DataBase = require("../database.js");
var randomWords = require('random-words');
var db = new DataBase();

class Letter {
  constructor(author = null, pseudonym = null, text = null) {
    if (text == null || author == null) {
      // dummy letter is used by other functions
      return;
    }
    this.author = author.uuid;
    this.text = text;
    this.pseudonym = pseudonym;
    this.nick = Letter.gen_nick();
    this.recipient = null;
    this.approved = null;
    this.bow = null;
    this.sent = false;
    this.uuid = uuid.v4();
  }

  // public functions ========================================================

  to(recipient) {
    if (this.approved && recipient.id != this.author.id)
      this.recipient = recipient.uuid;
    this.save();
  }
  
  reauthor(user){
    this.author = user.uuid;
    this.save();
  }
  renick(new_nick){
    this.nick = new_nick;
  }
  burn() {
    this.recipient = null;
    this.save();
  }
  mark_sent(){
    this.sent=true;
    this.save();
  }

  approve(state = true) {
    this.approved = state;
    this.save();
  }

  claim(bow) {
    this.bow = bow.guild;
    this.save();
  }

  init() {
    var letter = db.new("letters", this);
    letter = Letter.reconstruct(this);
    return letter;
  }

  save() {
    var item = db.update("letters", { uuid: this.uuid }, this);
    item = Letter.reconstruct(this);
    return item;
  }

  delete() {
    var item = db.delete("letters", { uuid: this.uuid });
    item = Letter.reconstruct(this);
    return item;
  }

  // private functions =======================================================
  static gen_nick() {
    var rand = randomWords();
    return rand;
  }

  static find(uuid) {
    var letter = db.get("letters", { uuid: uuid });
    if (letter == null) {
      return null;
    }
    letter = Letter.reconstruct(letter);
    return letter;
  }

  static find_unprocessed(user = null) {
    var criteria = { approved: null, bow: null };
    if (user != null) {
      criteria = { approved: null, author: user.uuid };
    }
    var letters_raw = db.get_all("letters", criteria);
    var letters = [];
    for (var i in letters_raw) {
      var letter = Letter.reconstruct(letters_raw[i]);

      letters.push(letter);
    }
    return letters;
  }
  static find_unsent() {
    var criteria = { approved: true,sent:false };
    var letters_raw = db.get_all("letters", criteria);
    var letters = [];
    for (var i in letters_raw) {
      var letter = Letter.reconstruct(letters_raw[i]);
      letters.push(letter);
    }
    return letters;
  }

  static find_by_persons(user0, user1) {
    var letter = db.get("letters", {
      author: user0.uuid,
      recipient: user1.uuid
    });
    if (letter == null) {
      letter = db.get("letters", { author: user1.uuid, recipient: user0.uuid });
      if (letter == null) {
        return null;
      }
    }
    letter = Letter.reconstruct(letter);
    return letter;
  }
  static find_by_nicks(user, nick) {
    var letter = db.get("letters", { author: user.uuid, nick: nick });
    if (letter == null) {
      letter = db.get("letters", { recipient: user.uuid, pseudonym: nick });
      if (letter == null) {
        return null;
      }
    }
    letter = Letter.reconstruct(letter);
    return letter;
  }

  static reconstruct(obj) {
    var empty = new Letter();
    return Object.assign(empty, obj);
  }

  static all() {
    var letters = db.all("letters");
    return letters;
  }

  static print(verbose=false,all=false) {
    var letters = db.all('letters');
    var result = ""
    for (var i in letters){
      var letter = letters[i];
      var letter_str = letter.uuid;
      if (verbose) letter_str = JSON.stringify(letter);
      result+="\n- "+ letter_str;
      if (!all && result.length>200){
        return result;
      }
    }
    return result;
  }
  
  static nuke() {
    db.nuke("letters");
  }
}

module.exports = Letter;

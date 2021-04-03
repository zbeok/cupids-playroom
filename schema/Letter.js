var uuid = require("uuid");

class Letter {
  constructor (author,pseudonym,text) {
    this.author = author;
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
  }
  
}

module.exports = Letter;
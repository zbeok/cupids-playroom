var uuid = require("uuid");

class User {
  constructor (pseudonym="") {
    this.id = null;
    this.token = null;
    this.pseudonym = pseudonym;
    this.letters = {};
    this.uuid = uuid.v4();

  }
  init (){
    var result_user = this.db
      .get("users")
      .push(this)
      .write();
    return result_user[0]
  }
  static reconstruct(obj) {
    var empty = new User();
    return Object.assign(empty, obj);
  }
  
  add_letter(letter){
    this.letters[letter.uuid] = letter;
  }
  
}

module.exports = User;
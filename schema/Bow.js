class Bow {
  constructor(msg) {
    this.guild = msg.guildID
    this.channel = msg.channel;
    this.host = msg.author;
    this.delimiter = "|";
    this.slots = 30;
  }
  static reconstruct(obj) {
    var empty = new Letter();
    return Object.assign(empty, obj);
  }
  
  
}

module.exports = Bow;
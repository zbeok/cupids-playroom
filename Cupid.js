// vars ===========================================
const Bow = require("./schema/Bow");
const User = require("./schema/User");
const Letter = require("./schema/Letter");
const Eris = require("eris");
const needle = require("needle");

// CUPID ===========================================
// highlevel class for overarching actions and bot stuff
class Cupid {
  constructor() {
    const bot = new Eris(process.env.DISCORD_BOT_TOKEN); // Replace DISCORD_BOT_TOKEN in .env with your bot accounts token
    this.bot = bot;

    bot.on("ready", () => {
      // When the bot is ready
      console.log("Bot ready!");
    });

    //when server message creation exists
    bot.on("messageCreate", msg => {
      // we don't pay attention to bots here
      if (msg.author.bot) {
        return;
      }
      // this is a dm or group dm!
      if (msg.channel.type == 1 || msg.channel.type == 3) {
        var user = User.find_id(msg.author.id);
        if (user == null) {
          bot.createMessage(
            msg.channel.id,
            "hello! i don't recognize you, have we met? Introduce yourself to me at https://cupids-playroom.glitch.me/ ! " +
              "if this is an error please let my developer know at snerkflerks#9048! "
          );
          return;
        } else if (msg.content == "goodbye sweet angels") {
          this.unsubscribe(user);
        }
        // TODO: dm recipient?
        return;
      }
      
      //new bow!
      var bow = Bow.find(msg.guildID);
      if (bow == null) {
        console.log("mod action");
        if (msg.content == "awaken, my love") {
          var bow = new Bow(msg);
          bow.init();
          bot.createMessage(
            msg.channel.id,
            "hello angels! your workspace is setup for matchmaking!"
          );
        } else if (msg.content.includes("cupid")) {
          bot.createMessage(
            msg.channel.id,
            "hello i'm cupid! i noticed that i'm here but you didn't wake me up. try typing ||awaken, my love|| to begin!"
          );
        }
        return;
      }

      // moderator actions
      if (msg.channel.id != bow.channel.id) return;
      // TODO add: approval process, queue check
      if (msg.content == 'queue') {
        var queue = this.queue_to_string(bow);
        bot.createMessage(msg.channel.id, queue);
      }
      // admin actions
      if (msg.author != bow.host) {
        return;
      }
      if (msg.content == "mr gorbachev, nuke this bitch") {
        bot.createMessage(msg.channel.id, "nuking this bitch...");
        cupid.nuke();
      }
    });

    bot.on("typingStart", channel => {
      if (channel.type == 1 || channel.type == 3) {
        //search for partner. send typing event to them
        var user = User.find(channel.recipient.id);
        if (user == null) {
          return;
        }
        for (var letter in user.letters) {
          if (letter.recipient != null) {
            bot.sendChannelTyping(letter.recipient);
          }
        }
      }
    });

    bot.connect(); // Get the bot to connect to Discord

    setInterval(()=>{this.poll_letters(this);}, 1 * 1000); // every minute
  }
  // TODO make the id the thing to watch out for.
  receive_letter(pseudonym, letter, uuid = null) {
    var user = User.find(uuid);
    if (user == null) {
      user = new User();
      user.init();
    }
    var letter = new Letter(user, pseudonym, letter);
    letter.init();
    user.add_letter(letter);
    return { user: user, letter: letter };
  }

  init_user(uuid, code) {
    var user = User.find(uuid);
    if (user == null) {
      console.log("No user to init. Error...");
    }

    this.exchange_code(code, body => {
      user.add_token(body.access_token);
      this.add_user_id(user.uuid);
    });
    return user;
  }

  poll_letters(cupid) {
    // TODO add to bow queue
    var letters = Letter.find_unprocessed();
    for (var i in letters) {
      var letter =letters[i]; 
      // console.log(letter);
      cupid.send_letter_to_mods(letter.author, letter);
    }
  }
  
  send_letter_to_mods(author, letter) {
    //distribute it to a bow
    var bow = Bow.random();
    if (bow == null) {
      return;
    } else {
      //find user responsible
      letter.claim(bow);
      bow.add_letter(letter);
      this.bot.createMessage(
        bow.channel.id,
        "hello angels! you've got mail!\n" +
          letter.pseudonym +
          " sends:\n" +
          letter.text
      );
    }
  }

  resolve_letter(bow, letter, approve) {
    if (approve) {
      var recipient = User.random();
      letter.approve();
      letter.to(recipient);
      recipient.add_delivery(letter);
    } else {
      var author = User.find(letter.author_uuid);
      this.dm(
        author,
        "the cupids have deemed your letter unfit for their standards, and urge you to try again. sorry :("
      );
    }
    bow.remove_letter(letter);
  }
  
  queue_to_string(bow){
    var queue = "Queue:";
    for (var i in bow.queue) {
      var letter = Letter.find(bow.queue[i]);
      queue+="\n  - "+letter.pseudonym + " said " + letter.text;
    }
    return queue;
  }

  unsubscribe(user) {
    for (var letter_uuid in user.letters) {
      var letter = Letter.find(letter_uuid);
      if (letter.recipient) {
        var recipient = User.find(letter.recipient);
        recipient.delete_delivery(letter);
      }
      letter.delete();
    }
    for (var letter_uuid in user.deliveries.keys()) {
      var letter = Letter.find(letter_uuid);
      letter.burn();
    }
    user.delete();
  }
  
  quit_bow(bow) {
    bow.delete();
  }

  spurn(user, recipient) {
    var letter = Letter.find_by_persons(user, recipient);
    if (letter == null) {
      return;
    }
    letter.recipient.delete_delivery(letter);
    letter.burn();
  }

  dump_db() {
    var users = User.all();
    var bows = Bow.all();
    var letters = Letter.all();
    return { users: users, bows: bows, letters: letters };
  }

  nuke_users() {
    User.nuke();
  }

  nuke_bows() {
    Bow.nuke();
  }

  nuke() {
    User.nuke();
    Bow.nuke();
    Letter.nuke();
  }

  // warning! async functions below =================================

  dm(user, text) {
    this.bot.getDMChannel(user.id).then(channel => {
      this.bot.createMessage(channel.id, text);
    });
  }

  exchange_code(code, callback_fn) {
    var data = {
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.url,
      scope: "identify"
    };
    var options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    needle.post(
      process.env.api_endpoint + "/oauth2/token",
      data,
      options,
      function(error, response) {
        if (!error && response.statusCode == 200) {
          callback_fn(response.body);
        } else {
          console.log(response.body);
        }
      }
    );
  }

  add_user_id(uuid) {
    var cupid = this;
    var user = User.find(uuid);
    var options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer " + user.token
      }
    };

    needle.get(process.env.oauth_api_url + "/users/@me", options, function(
      error,
      response
    ) {
      if (!error && response.statusCode == 200) {
        user.add_id(response.body.id);
        user.add_username(
          response.body.username + "#" + response.body.discriminator
        );
        cupid.dm(
          user,
          "please wait! cupids are processing your request now ^_^"
        );
        return response.body.id;
      } else {
        console.log(response.body);
      }
    });
  }
}

module.exports = Cupid;

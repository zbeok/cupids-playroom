// modules =================================================
const Eris = require("eris");
const needle = require("needle");
const Bow = require("./schema/Bow");
const User = require("./schema/User");
const Letter = require("./schema/Letter");
const flavor_text = require("./flavor_text");

// CUPID ===========================================
// highlevel class for overarching actions and bot stuff
class Cupid {
  constructor() {
    const bot = new Eris(process.env.DISCORD_BOT_TOKEN); // Replace DISCORD_BOT_TOKEN in .env with your bot accounts token
    this.bot = bot;
    this.id = "cupidbot";
    this.poll_interval = 20 * 1000;
    this.letter_cap = 10;

    // bot =========================================

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
      // admin actions take precedence, so check this first.
      if (msg.author.id == process.env.admin_id) {
        if (msg.content == this.id + " nuke all") {
          bot.createMessage(msg.channel.id, "nuking all bitchezzz");
          this.nuke();
          return;
        } else if (msg.content == this.id + " nuke users") {
          bot.createMessage(msg.channel.id, "nuking the users");
          User.nuke();
          return;
        } else if (msg.content == this.id + " nuke bows") {
          bot.createMessage(msg.channel.id, "nuking the bows");
          Bow.nuke();
          return;
        } else if (msg.content == this.id + " nuke letters") {
          bot.createMessage(msg.channel.id, "nuking the letters");
          Letter.nuke();
          return;
        } else if (msg.content == this.id + " spill") {
          bot.createMessage(msg.channel.id, this.dump_db(true));
        }
      }

      // this is a dm or group dm!
      if (msg.channel.type == 1 || msg.channel.type == 3) {
        var user = User.find_id(msg.author.id);
        if (user == null) {
          bot.createMessage(
            msg.channel.id,
            flavor_text['user_help']
          );
          return;
        } else if (msg.content == "goodbye sweet angels") {
          this.unsubscribe(user);
        } else if (msg.content == this.id + " help") {
          this.dm(
            user,
            flavor_text['user_help']
          );
        } else if (msg.content == this.id + " letters") {
          this.dm(
            user,
            "here are the letters you've been involved with so far:\n" +
              this.print_letters(user)
          );
        } else if (msg.content.includes(this.id + " bye ")) {
          var bits = msg.content.split(" ");
          var nick = bits[2];
          var letter = Letter.find_by_nicks(user, nick);
          this.spurn(letter.author, letter.recipient);
          this.dm(user, "i hope you meant it! said goodbye to " + nick + ".");
        } else if (msg.content.includes(this.id + " delete ")) {
          var bits = msg.content.split(" ");
          var nick = bits[2];
          var letter = Letter.find_by_nicks(user, nick);
          this.spurn(letter.author, letter.recipient);
          letter.delete();
          this.dm(
            user,
            "hope you wrote that letter down, and had your talking all done!"
          );
        } else if (msg.content.includes("@")) {
          var bits = msg.content.slice(1).split(" ");
          var nick = bits[0];
          var text = msg.content.slice(2 + nick.length);
          var letter = Letter.find_by_nicks(user, nick);
          console.log(user,nick);
          if (letter==null) return;
          var anon_uuid =
            letter.author == user.uuid ? letter.recipient : letter.author;
          var anon = User.find(anon_uuid);
          this.dm(anon, text);
        }

        return;
      }

      //new bow if needed
      var bow = Bow.find(msg.guildID);
      if (bow == null) {
        if (msg.content == "awaken, my love") {
          var bow = new Bow(msg);
          bow.init();
          bot.createMessage(
            msg.channel.id,
            "hello angels! your workspace is setup for matchmaking!"
          );
        } else if (msg.content.includes("cupidbot")) {
          bot.createMessage(
            msg.channel.id,
            "hello i'm cupid! i noticed that i'm here but you didn't wake me up. try typing ||awaken, my love|| to begin!"
          );
        } 
        return;
      }

      // moderator actions
      if (msg.channel.id != bow.channel.id) return;
      if (msg.content == this.id + " help") {
          bot.createMessage(
            msg.channel.id,
            flavor_text['mod_help']
          );
      } else if (msg.content == this.id + " queue") {
        // check the queue
        
        var queue = this.queue_to_string(bow);
        bot.createMessage(msg.channel.id, queue);
      } else if (msg.content == this.id + " users") {
        // print users
        var users_s = "Users:" + User.print();
        bot.createMessage(msg.channel.id, users_s);
      } else if (msg.content.includes(this.id + " ban")) {
        // print users
        var bits = msg.content.split(" ");
        var user = User.find_by_id(bits[2]);
        this.ban(user);
      } else if (msg.content.includes(bow.delimiter)) {
        // process letter
        var bits = msg.content.split(bow.delimiter);
        var letter_uuid = bow.queue[parseInt(bits[0])];
        var letter = Letter.find(letter_uuid);
        var status = bits[1].trim();
        this.resolve_letter(bow, letter, status);
      }
        this.poll_letters(this);
      
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

    setInterval(() => {
      this.poll_letters(this);
    }, this.poll_interval);
  }
  
  // TODO make the id the thing to watch out for.
  receive_letter(pseudonym, text, uuid = null) {
    var user = User.find(uuid);
    if (user == null) {
      user = new User();
      user.init();
    }
    var unprocessed = Letter.find_unprocessed(user);
    var letter = null;

    if (unprocessed.length <= this.letter_cap) {
      letter = new Letter(user, pseudonym, text);
      letter.init();
      user.add_letter(letter);
    } else {
      this.dm(
        user,
        "we're sorry, you've reached letter cap!" +
          " we know you worked hard to write it though, so here's a copy of your letter here:\n" +
          "to the lovely stranger this letter finds...\n" +
          text +
          "\nlove," +
          pseudonym
      );
    }
    return { user: user, letter: letter };
  }

  init_user(uuid, code) {
    var user = User.find(uuid, false);
    if (user == null) {
      console.log("No user to init. Error...");
    }

    this.exchange_code(code, body => {
      user.add_token(body.access_token);
      this.add_user_id(user);
    });
    return user;
  }
  
  merge_user(defunct, persistent) {
    for (var uuid in defunct.letters) {
      var letter = Letter.find(uuid);
      letter.reauthor(persistent);
    }
    for (var uuid in defunct.deliveries) {
      var letter = Letter.find(uuid);
      letter.to(persistent);
    }
    defunct.delete();
  }
  
  poll_letters(cupid) {
    var unprocessed_letters = Letter.find_unprocessed();
    for (var i in unprocessed_letters) {
      var letter = unprocessed_letters[i];
      cupid.send_letter_to_mods(letter.author, letter);
    }
    var unsent_letters = Letter.find_unsent();
    for (var i in unsent_letters) {
      var letter = unsent_letters[i];
      cupid.send_letter(letter);
    }
  }

  send_letter_to_mods(author, letter) {
    //distribute it to a bow
    var bow = Bow.random();
    if (bow == null ) {
      return;
    } else {
      //find user responsible
      var user = User.find(author);
      if ( user==null || (user !=null && user.id==null)) {
        console.log(user);
        return;
      }
      letter.claim(bow);
      bow.add_letter(letter);
      this.bot.createMessage(
        bow.channel.id,
        "hello angels! you've got mail!\n" +
          letter.pseudonym +
          " sends:\n" +
          letter.text
      );
      this.dm(user, "please wait! your letter is in the cupids queue as we speak. <3 ");
    }
  }

  resolve_letter(bow, letter, status) {
    
    var approve = null;
    if (
      status.includes("no") ||
      status.includes("bad") ||
      status.includes("false")
    ) {
      approve = false;
    } else if (
      status.includes("yes") ||
      status.includes("true") ||
      status.includes("go")
    ) {
      approve = true;
    }
    
    var author = User.find(letter.author);
    if (author==null) return;
    
    if (approve) {
      recipient = author.random();
      if (recipient == null) {
        return;
      }
      letter.approve();
      letter.to(recipient);
      this.bot.createMessage(bow.channel.id, "letter posted to queue!! thank you <3");
      bow.remove_letter(letter);
    } else if (approve == false) {
      this.dm(
        author,
        "the cupids have deemed your letter unfit for their standards, and urge you to try again. sorry :("
      );
      this.bot.createMessage(bow.channel.id, "letter rejected. so it goes :^)");
      letter.mark_sent();
      letter.approve(false);
      bow.remove_letter(letter);
    } else {
      var recipient_num = status;
      var recipient = User.find(recipient_num);
      if (recipient==null) {
        recipient = User.find_by_id(recipient_num);
      }
      if (recipient!=null) {
        letter.approve();
        letter.to(recipient);
        this.bot.createMessage(bow.channel.id, "letter posted to queue!! thank you <3");
        return;
      }
      this.bot.createMessage(bow.channel.id, "idk who that is lol. try their uuid or id?");
      
    }
  }
  
  
  send_letter(letter) {
    var recipient = User.find(letter.recipient);
    var author = User.find(letter.author);
    if (recipient==null) return;
    recipient.add_delivery(letter);
    var bow = Bow.find(letter.bow);
    this.bot.createMessage(bow.channel.id, "letter en route !");
    letter.mark_sent();
    this.dm(recipient,
            "You've got mail from a mysterious stranger! \n From: "+letter.pseudonym +":\n"+
            letter.text
           );
    this.dm(author,
            "Your letter was sent, congrats!! It went to: "+letter.nick +". I hope something beautiful happens!"
           );
  }

  print_letters(user) {
    var result = "Letters from you:";
    for (var uuid in user.letters) {
      var letter = Letter.find(uuid);
      var to = (letter.recipient != null) ? "to: " : "to (temporary name): ";
      result += "\nfrom:" + letter.pseudonym + "\n" + to +letter.nick+"\n"+ letter.text + "\n";
    }
    result += "\nLetters addressed to you:";
    for (var uuid in user.deliveries) {
      var letter = Letter.find(uuid);
      var to = "to (your anonymous name): ";
      result += "\nfrom:" + letter.pseudonym + "\n" + to +letter.nick+"\n"+ letter.text + "\n";
    }
    return result;
  }

  queue_to_string(bow) {
    var queue = "Queue:";
    for (var i in bow.queue) {
      var letter = Letter.find(bow.queue[i]);
      queue += `\n   ${i}. ${letter.pseudonym} said ${letter.text}`;
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

  dump_db(str = false) {
    if (str) {
      var users = User.print();
      var bows = Bow.print();
      var letters = Letter.print();
      return "users:" + users + "\nbows:" + bows + "\nletters:" + letters;
    }
    var users = User.all();
    var bows = Bow.all();
    var letters = Letter.all();
    return { users: users, bows: bows, letters: letters };
  }
  
  ban(user) {
    this.unsubscribe(user);
    //todo: ip ban too lol
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

  add_user_id(user) {
    var cupid = this;
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
        var query_user = User.find_id(response.body.id);
        if (query_user != null) {
          cupid.merge_user(user, query_user);
        } else {
          user.add_id(response.body.id);
          user.add_username(
            response.body.username + "#" + response.body.discriminator
          );
          cupid.dm(user, "welcome 2 our playroom! ask for help via `cupidbot help`! ^_^");
        }
        return response.body.id;
      } else {
        console.log(response.body);
      }
    });
  }
}

module.exports = Cupid;

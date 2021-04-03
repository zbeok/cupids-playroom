// vars ===========================================
const Bow = require("./schema/Bow");
const User = require("./schema/User");
const Eris = require("eris");
const needle = require("needle");

// CUPID ===========================================
// highlevel class for overarching actions and bot stuff
class Cupid {
  constructor(db) {
    this.db = db;
    const bot = new Eris(process.env.DISCORD_BOT_TOKEN); // Replace DISCORD_BOT_TOKEN in .env with your bot accounts token
    this.bot = bot;

    bot.on("ready", () => {
      // When the bot is ready
      console.log("Bot ready!"); // Log "Ready!"
    });

    //when server message creation exists
    bot.on("messageCreate", msg => {
      // we don't pay attention to bots here
      if (msg.author.bot) {
        return;
      }
      // this is a dm or group dm!
      if (msg.channel.type == 1 || msg.channel.type == 3) {
        var query_user = db
          .get("users")
          .filter({ id: msg.author.id })
          .value();
        console.log(query_user);
        if (query_user.length == 0 || query_user.length > 1) {
          bot.createMessage(
            msg.channel.id,
            "hello! i don't recognize you, have we met? Introduce yourself to me at https://cupids-playroom.glitch.me/ ! " +
              "if this is an error please let my developer know at snerkflerks#9048! "
          );
          return;
        }
        var user = query_user[0];
        return;
      }
      //new bow!
      var bow = db
        .get("bows")
        .find({ guild: msg.guildID })
        .value();
      if (bow == null) {
        if (msg.content == "awaken, my love") {
          var bow = new Bow(msg);
          var result = db
            .get("bows")
            .push(bow)
            .write();
          console.log(result);
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
      // admin actions
      if (msg.content == "mr gorbachev, nuke this bitch") {
        bot.createMessage(msg.channel.id, "nuking this bitch...");

        needle.delete(process.env.url + "/clear/users", function(
          error,
          response
        ) {
          if (!error && response.statusCode == 200) {
            console.log(response.body);
          } else {
            bot.createMessage(
              msg.channel.id,
              "houston we have a.... problem... " + error
            );
          }
        });
      }
      //       if (msg.content.includes(this.userdata.delimiter)) {
      //         var spoken = msg.content.split(this.userdata.delimiter);
      //         spoken[0] = spoken[0].trim();
      //         spoken[1] = spoken[1].trim();
      //         if (spoken.length == 0 || spoken[0] == "" || spoken[1] == "") {
      //           bot.createMessage(
      //             this.userdata.channel_id,
      //             "you didnt say anything to anyone"
      //           );
      //         } else {
      //           var tosend = ["g", spoken[1]];
      //           if (god_data.users[spoken[0]] != null) {
      //             god_data.users[spoken[0]]["txt"].push(tosend);
      //           } else {
      //             var users = Object.keys(god_data.users);
      //             for (var i = 0; i < users.length; i++) {
      //               if (god_data.users[users[i]]["name"] == spoken[0]) {
      //                 god_data.users[users[i]]["txt"].push(tosend);
      //                 return;
      //               }
      //             }
      //             bot.createMessage(
      //               god_data.msglocation,
      //               "you didnt say anything to anyone"
      //             );
      //           }
      //         }

      //         if (god_data.msglocation != msg.channel.id) {
      //           god_data.msglocation = msg.channel.id;
      //           bot.createMessage(
      //             god_data.msglocation,
      //             "id of channel has changed. curious"
      //           );
      //         }
      //       }
      //       if (msg.content.includes("god")) {
      //         if (msg.content.includes("users")) {
      //           var tosend = "here are all the users on right now:";
      //           for (var user in god_data.users) {
      //             tosend += "\n" + user;
      //             console.log(user);
      //             if (god_data.users[user].name != null)
      //               tosend += " aka " + god_data.users[user].name;
      //           }
      //           bot.createMessage(god_data.msglocation, tosend);
      //         }
      //       }
    });

    bot.on("typingStart", channel => {
      if (channel.type == 1 || channel.type == 3) {
        //search for partner. send typing event to them
        var user = db
          .get("users")
          .find({ id: channel.recipient.id })
          .value();
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
  }
  new_user(pseudonym) {
    var new_user = new User(pseudonym);
    var result_user = this.db
      .get("users")
      .push(new_user)
      .write();
    return result_user[0];
  }
  update_user(uuid, token) {
    var user = this.db
      .get("users")
      .find({ uuid: uuid })
      .value();
    if (user == null) return;

    var result_user = this.db
      .get("users")
      .find({ uuid: uuid })
      .assign({ token: token })
      .write();
    return result_user;
  }
  send_letter_to_mods(author, letter_txt) {
    //distribute it to a bow
    var query_bows = this.db.get("bows").value();
    if (query_bows.length == 0) {
      return;
    } else {
      var bow = query_bows[0];
      //find user responsible
      var user = this.bot.users.find(username => {
        console.log(username);
        return username == author;
      });
      console.log(user);
      return;
      this.bot.createMessage(bow.channel.id, author + " says:\n" + letter);
    }
  }
  exchange_code(code) {
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
    needle.get(
      process.env.api_endpoint + "/oauth2/token",
      data,
      options,
      function(error, response) {
        if (!error && response.statusCode == 200) {
          console.log(response.body);
          return response.body;
        } else {
          console.log(error);
        }
      }
    );
  }
}

module.exports = Cupid;

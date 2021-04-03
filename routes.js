const User = require('./schema/User');
const Letter = require('./schema/Letter');

module.exports = function(app, cupid, god_data) {
  var msglocation = god_data.msglocation;
  var bot = cupid.bot;
  var db = cupid.db;
  
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.post("/mailbox", function(req, res) {
    // god_data.users[req.session.id]['name']=req.query.name;
    var user = cupid.new_user(req.body.pseudonym);
    var letter = new Letter(user.id,req.body.letter);    
    console.log(user);
    user = User.reconstruct(user);
    user.add_letter(letter);
    res.status(200).send({user:user,letter:letter});
  });
  
  app.put("/token", function(req, res) {
    // god_data.users[req.session.id]['name']=req.query.name;
    var uuid =  req.body.uuid;
    var code = req.body.code;    
    var token = cupid.exchange_code(code);
    var user = cupid.update_user(uuid,token);
    res.status(200).send("letter is now being sent to mods!");
  });
  
  
  app.delete("/clear/users", function(req, res) {
    // removes all entries from the collection
    console.log("User data cleared")
    db.get('users')
    .remove()
    .write()
    res.send("User data cleared");
  });
  
  var options = { root: "." };
  
  // frontend routes =========================================================

  app.get("/about", function(req, res) {
    res.sendFile("./public/about.html", options);
  });
  app.get("*", function(req, res) {
    res.sendFile("./public/index.html", options);
  });
};

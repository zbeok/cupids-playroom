const User = require('./schema/User');
const Letter = require('./schema/Letter');

module.exports = function(app, cupid) {
  var bot = cupid.bot;
  var db = cupid.db;
  
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.post("/mailbox", function(req, res) {
    var result = cupid.receive_letter(req.body.pseudonym,req.body.letter);
    cupid.send_letter_to_mods(result.user.uuid,result.letter);
    res.status(200).send({user:result['user'],letter:result['letter']});
  });
  
  app.put("/token", function(req, res) {
    var uuid =  req.body.uuid;
    var code = req.body.code;    
    var user = cupid.init_user(uuid,code);
    res.status(200).send(user.code);
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

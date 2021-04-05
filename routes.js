module.exports = function(app, cupid) {
  var bot = cupid.bot;
  
  // server routes ===========================================================
  // handle things like api calls
  // authentication routes
  app.post("/mailbox", function(req, res) {
    var result = cupid.receive_letter(req.body.pseudonym,req.body.letter,req.body.uuid);
    res.status(200).send({user:result['user'],letter:result['letter']});
  });
  
  app.put("/token", function(req, res) {
    var uuid =  req.body.uuid;
    var code = req.body.code;    
    var user = cupid.init_user(uuid,code);
    res.status(200).send(user.code);
  });
  
  app.get("/all", function(req, res) {
    
    res.status(200).send(cupid.dump_db());
  });
  
  app.get("/letters", function(req, res) {
    // var uuid =  req.body.uuid;
    // var code = req.body.code;    
    // var user = cupid.init_user(uuid,code);
    res.status(200).send("TODO");
  });
  
  app.delete("/clear/users", function(req, res) {
    // removes all entries from the collection
    console.log("User data cleared")
    cupid.nuke_users();
    res.send("User data cleared");
  });
  app.delete("/clear/bows", function(req, res) {
    // removes all entries from the collection
    console.log("Bow data cleared")
    cupid.nuke_bows();
    res.send("Bow data cleared");
  });
  
  app.delete("/clear/all", function(req, res) {
    // removes all entries from the collection
    cupid.nuke();
    res.send("all data cleared");
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

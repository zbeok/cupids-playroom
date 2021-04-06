var express = require("express");

module.exports = function(app, cupid) {
  var bot = cupid.bot;
  var options = { root: "." };
  
// server routes ===========================================================
  
  // get
  // app.get("/api/letters", function(req, res) {
  //   // var uuid =  req.body.uuid;
  //   // var code = req.body.code;    
  //   // var user = cupid.init_user(uuid,code);
  //   res.status(200).send("TODO");
  // });
  
  //put/posts
  app.post("/api/mailbox", function(req, res) {
    var result = cupid.receive_letter(req.body.pseudonym,req.body.letter,req.body.uuid);
    console.log(result);
    if (result['letter']==null) {
      res.status(400).send({"error":"you've reached the active letter cap. thank you for playing! "+
                            "a copy of this letter will be sent to your discord, so don't worry if you worked too hard on it."});
      return;
    }
    res.status(200).send({user:result['user'],letter:result['letter']});
  });
  
  app.put("/api/token", function(req, res) {
    var uuid =  req.body.uuid;
    var code = req.body.code;    
    var user = cupid.init_user(uuid,code);
    res.status(200).send(user.code);
  });
  
  // DEBUG FUNCTIONS (disable on beta) =====================
  
//   app.get("/all", function(req, res) {
//     res.status(200).send(cupid.dump_db());
//   });
  
  // frontend routes =========================================================

  app.get("/about", function(req, res) {
    res.sendFile("./public/about.html", options);
  });
  
  app.get("/letters", function(req, res) {
    res.sendFile("./public/letters.html", options);
  });
  
  app.get("/", function(req, res) {
    res.sendFile("./public/index.html", options);
  });
  
  app.use(express.static(__dirname + "/public")); // set the static files location 
  
  app.get("*", function(req, res) {
    res.sendFile("./public/404.html",{root:'.'});
  });
};

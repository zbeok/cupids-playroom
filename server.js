// modules =================================================
var express = require("express");
var session = require("express-session");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
const Eris = require("eris");
const Cupid = require("./Cupid");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// vars ====================================================

const adapter = new FileSync('.data/db.json')
const db = low(adapter)
// default user list
db.defaults({ bows: [], 
             users: []
  }).write();
var cupid = new Cupid(db);

// configuration ===========================================

var port = process.env.PORT || 8080; // set our port

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(
  session({
    secret: "themoremaudlinthemerrier", // just a long random string
    resave: false,
    saveUninitialized: true
  })
);
app.use(methodOverride("X-HTTP-Method-Override")); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

app.use(express.static(__dirname + "/public")); // set the static files location /public/img will be /img for users
require("./routes")(app, cupid); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log("Magic happens on port " + port); // shoutout to the user
exports = module.exports = app; // expose app

const fs = require("fs");


var flavor_text = {
  "mod_help": read_file("./txt/mod_guide.md"),
  "user_help": read_file("./txt/user_guide.md")
};

function read_file(filename) {
  var result = "";
  try {
    const data = fs.readFileSync(filename, "utf8");
    result = data;
  } catch (err) {
    result = "error. ping snerkflerks#9048 please!";
  }
  return result;
}
module.exports = flavor_text;

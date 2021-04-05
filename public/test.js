document.addEventListener("keypress", onDocumentKeyPress, false);

function onDocumentKeyPress(e) {
  if (e.key == "!") {    
    nuke_users();
  } else if (e.key == "?") {
    nuke();
  } else if (e.key == "%") {
    nuke_bows();
  } else if (e.key == "@") {
    all_db();
  } else {
    console.log("pressed key: " + e.key);
  }
}
function nuke_users(){
   
    $.ajax({
      url: "/clear/users",
      type: "DELETE",
      success: function(result) {
        console.log(result);
        window.localStorage.clear();
      }
    });
}
function nuke_bows(){
   
    $.ajax({
      url: "/clear/bows",
      type: "DELETE",
      success: function(result) {
        console.log(result);
      }
    });
}
function nuke(){
   
    $.ajax({
      url: "/clear/all",
      type: "DELETE",
      success: function(result) {
        console.log(result);
        window.localStorage.clear();
      }
    });
}
function all_db(){
  
    $.ajax({
      url: "/all",
      type: "GET",
      success: function(result) {
        console.log(result);
      }
    });
}
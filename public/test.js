document.addEventListener("keypress", onDocumentKeyPress, false);

function onDocumentKeyPress(e) {
  if (e.key == "d") {    
    nuke_users();
  } else if (e.key == "a") {
    $.ajax({
      url: "/likes?username=snerkflerks",
      type: "GET",
      success: function(result) {
        console.log(result);
      }
    });
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
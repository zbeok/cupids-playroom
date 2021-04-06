document.addEventListener("keypress", onDocumentKeyPress, false);

function onDocumentKeyPress(e) {
  if (e.key == "@") {
    all_db();
  } else if (e.key == "-") {
    localStorage.clear();
    console.log("Cleared localstorage");
  } else {
    console.log("pressed key: " + e.key);
  }
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
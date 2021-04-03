var storage = window.localStorage;

function sendmsg() {
  var pseudonym = document.getElementById("name").value.trim();
  var letter = document.getElementById("letterspace").value.trim();
  if (pseudonym == "" || letter == "") {
    alert("cmon you gotta write something dude")
    return;
    
  }
  const url = "/mailbox";
  var data = {
    "pseudonym":pseudonym,
    "letter":letter
  }
  
  $.ajax({
    url: "/mailbox",
    type: "POST",
    data:data,
    success: function(result) {
      var uuid = storage.getItem('user');
      if (uuid==null) {
        window.location.replace("https://discord.com/api/oauth2/authorize?client_id=827426423878189066&redirect_uri=https%3A%2F%2Fcupids-playroom.glitch.me%2F&response_type=code&scope=identify","_self")
      }
      storage.setItem('user', result.user.uuid);
      storage.setItem('letter', result.letter.uuid);
      console.log("letter on its way to cupid!")
    }
  });
  // document.getElementById("u-status").style.opacity = 1;
  // document.getElementById("txt").value = "";
}
function check_token() {
  const urlParams = new URLSearchParams(window.location.search);
  var code = urlParams.get('code');
  var uuid = storage.getItem('user');
  if (code!=null && uuid==null) {
    $.ajax({
      url: "/token",
      type: "PUT",
      data:{
        uuid:uuid,
        code:code
      },
      success: function(result) {
        console.log("token stored....")
        console.log(result);
      }
    });
  }
  console.log("letter sent to cupid!")
}
function init() {
}
check_token();
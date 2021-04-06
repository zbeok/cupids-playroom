var storage = window.localStorage;

function sendmsg() {
  var pseudonym = document.getElementById("name").value.trim();
  var letter = document.getElementById("letterspace").value.trim();
  if (pseudonym == "" || letter == "") {
    alert("cmon you gotta write something dude")
    return;
    
  }
  var uuid = storage.getItem('user');
  var data = {
    "pseudonym":pseudonym,
    "letter":letter,
    "uuid":uuid
  }
  
  $.ajax({
    url: "/api/mailbox",
    type: "POST",
    data:data,
    success: function(result) {
      alert("letter on its way to cupid! <3");
      var uuid = storage.getItem('user');
      storage.setItem('user', result.user.uuid);
      storage.setItem('letter', result.letter.uuid);
      if (uuid==null) {
        window.location.replace("https://discord.com/api/oauth2/authorize?client_id=827426423878189066&redirect_uri=https%3A%2F%2Fcupids-playroom.glitch.me%2F&response_type=code&scope=identify","_self")
      }
    },
    error:function(error){
      alert(error.responseJSON['error']);
      console.log(error.responseJSON['error']);
    }
  });
}

function check_token() {
  const urlParams = new URLSearchParams(window.location.search);
  var code = urlParams.get('code');
  var uuid = storage.getItem('user');
  var stored_code = storage.getItem('code');
  if (code!=null && stored_code == null) {
    $.ajax({
      url: "/api/token",
      type: "PUT",
      data:{
        uuid:uuid,
        code:code
      },
      success: function(result) {
        console.log("token stored....")
        storage.setItem('code', code);
        console.log(result);
      }
    });
  } 
}
check_token();
//opening/closing popup
document.getElementById("open").addEventListener("click", () => { openForm(); });
document.getElementById("close").addEventListener("click", () => { closeForm(); });

//switching between menu, faq and chat
document.getElementById('faq-button').addEventListener("click", () => { openFaq(); });
document.getElementById('consultant-button').addEventListener("click", () => { openChat(); });
document.getElementById('back-button').addEventListener("click", () => { openMenu(); });

document.getElementById('parent-form').addEventListener('click', (e) => { e.preventDefault(); });


//loading icon if the iframe content takes long to load
document.getElementById('iframe').addEventListener('load', () => {
  document.getElementById('loading').hidden = true;
});


//if the websocket iframe encounters an error, the user may return to menu
window.errorOccured = function(){
  openMenu();
}


//connects to faq iframe, hides menu form
async function openFaq(){ 
  document.getElementById('loading').hidden = false;

  //todo
  //change IP for prod server
  document.getElementById('iframe').src = "http://localhost:3000/faq.html";

  const iframeDiv = document.getElementById('iframe-div');
  iframeDiv.style.display = 'block';

  const form = document.getElementById('menu');
  form.style.display = 'none';

  const backButton = document.getElementById('back-button');
  backButton.style.visibility = 'visible';
}


//connects to socket chat iframe, hides menu form
async function openChat(){
  document.getElementById('loading').hidden = false;

  //todo
  //change IP for prod server
  document.getElementById('iframe').src = "http://localhost:3000/chat_window.html";

  const iframeDiv = document.getElementById('iframe-div');
  iframeDiv.style.display = 'block';

  const form = document.getElementById('menu');
  form.style.display = 'none';

  const backButton = document.getElementById('back-button');
  backButton.style.visibility = 'visible';
}


//closes iframe, opens menu form
function openMenu(){
  document.getElementById('iframe').src = "";

  document.getElementById('faq-button').style.filter = "";
  document.getElementById('consultant-button').style.filter = "";

  const iframeDiv = document.getElementById('iframe-div');
  iframeDiv.style.display = 'none';

  const form = document.getElementById('menu');
  form.style.display = 'block';

  const backButton = document.getElementById('back-button');
  backButton.style.visibility = 'hidden';
}


//called when the socket from the iframe receives a new message, used to handle the unread messages notification
window.serverMessage = () => {
  const newMessagesDiv = document.getElementById("unreadMessagesCount");

  //only increment if chat is closed
  if(document.getElementById("myForm").style.display == "none"){
    newMessagesDiv.innerText++;
  }

  //if any unread messages, unhide alert
  if(Number(newMessagesDiv.innerText) > 0){
    newMessagesDiv.hidden = false;
  }
}


function openForm () {
  document.getElementById("myForm").style.display = "block";

  //reset unread messages to 0 and hide alert
  const newMessagesDiv = document.getElementById("unreadMessagesCount");
  newMessagesDiv.innerText = 0;
  newMessagesDiv.hidden = true;
}


function closeForm () {
  document.getElementById("myForm").style.display = "none";
}


function howl () {
  var audio = new Audio('../assets/audio/Chewbacca_Sound_6.mp3');
  audio.volume = 0.17;
  audio.play();
}

export { openForm, closeForm, howl }




//change on deployment
//let IP = 'ws://localhost:17152';
//env
//ws://139.84.231.103:17152
//ws://localhost:17152
let SocketServerIP = 'ws://139.84.231.103:17152';
let ws;
//todo
//real auth
let name = prompt("Who are you?");
//socket message for when user is typing
let isBusyTyping = false;
//text message character limit
let characterLimit = 1000;
//used to ignore queue updates if chat has begun
let chatInProgress = false;
//todo
//save some sort of chat id or socket id, so we can reconnect to a chat if connection is lost
let chatId;

let consultantName = '';


//Chat button sending a message to the server
document.getElementById('send-message').addEventListener('click', (e) => {
  e.preventDefault();
  sendMessage();
});


//on error screens, we have a button to allow the user to return to the menu
document.getElementById('error-return').addEventListener('click', () => {
  window.parent.errorOccured();
});


//updates character/limit. Can also emit a typing event to show ('X user is typing a message...') to other side
document.getElementById('input').addEventListener('input', async() => {
  const charLength = document.getElementById('characterLength');

  charLength.innerText = `${document.getElementById('input').value.length}/1000`;

  if(charLength.innerText == '1000/1000'){
    charLength.style.color = 'red';
  }
  else{
    charLength.style.color = 'black';
  }

  //sends an event to show that the user is currently typing. Will set a flag so that this can only be sent once every 2 seconds
  if(!isBusyTyping){
    //todo
    //async
    //ws.send({ event: "NOTICE", payload: { event_sub_0: 'TYPING'} })

    isBusyTyping = true;

    await new Promise(r => setTimeout(() => { isBusyTyping = false; r }, 2000));
  }
});


//displays an error screen which covers the chat
//isMenuButton -> if true, the error will display a button allowing the user to return to menu
//isReconnecting -> if true, the client will attempt to reconnect to the server every 5 seconds
function displayErrorScreen(textToDisplay, isMenuButton, isReconnecting = false){
  const errorScreen = document.getElementById('socket-error');
  const menuButton = document.getElementById('error-return');
  let errorMessage = document.getElementById('error-description');

  errorMessage.innerText = textToDisplay;

  if(isMenuButton){
    menuButton.style.display = "block"
  }
  else{
    menuButton.style.display = "none"
  }

  if(isReconnecting){
    setTimeout(function() {
      errorScreen.style.display = "none"
      connect();
    }, 5000);
  }

  errorScreen.style.display = "block"
}


function connect(){
  ws = new WebSocket(SocketServerIP);

  //maybe return some sort of ID and save it in a variable outside of connect, try to reuse this var if it exists

  console.log('Connecting...');

  //connection to server
  ws.onopen = (() => {
    ws.send(JSON.stringify({
      event: 'JOIN',
      payload: {
        email: 'MITemailexample@edu',
        first_name: name,
        event_sub_0: 'CLIENT'
      }
    }));

  displayQueue();
  });


  //receiving an event from server
  ws.onmessage = ((message) => {
    let receivedData = JSON.parse(message.data);
    console.log('Incoming data: ', receivedData);

    switch(receivedData.event){
      case 'NOTICE': 
        switch(receivedData.payload.event_sub_0){
          case 'PIQ':     
            if(!chatInProgress){
              updateQueue(receivedData);
            }
            break;

          case 'NO-CONSULTANTS-ONLINE':
            noConsultantsOnline();
            break;

          case 'FIQ':
            startChat(receivedData);
            break;

          default:
            console.log('Unknown message received 2.', receivedData)
            break;
        }
        break;
      
      case 'MESSAGE':
        switch(receivedData.payload.event_sub_0){
          case 'FROM-CLIENT':
            console.log('from client', receivedData);
            //echo
            break;

          case 'FROM-CONSULTANT':
            console.log('from consultant', receivedData);
            messageReceived(receivedData);
            break;

          default:
            console.log('Unknown message received 3.', receivedData)
            break;
        }
        break;

      //todo
      //remove these and add them as correct sub events
      case 'CLOSE':
        //todo
        //think this will rather be an onclose event that fires when server terminates connection

        endChat();
        break;

      case 'TYPING':
          typingNotice();
        break;

      case 'RESUME':
        //todo
        //not sure about this one, if a ticket is put on hold and resumed? Maybe this is handled on the server entirely
        break;

      default:
        console.log('Unknown message received.', receivedData);
        break;
    }
  });


  //if connection fails, displays error screen and takes user back to menu
  ws.onerror = (event) => {
    console.log('An error occured: ', event);

    ws.close();
  }


  ws.onclose = (event) => {
    if(event.code == 1000){
      //todo
      //if socket is closed from server
      //maybe this will rather be a message
      endChat();

      console.log('Connection closed: ', event);
    }
    else{
      console.log('Connection closed abnormally: ', event);

      //todo
      //if client has no internet connection, try reconnect every 5 sec
      //make sure things are being init correctly every time we recon
      //recon will create new connection so you will lose your consultant
      if(!navigator.onLine) {
        displayErrorScreen('You are offline, reconnecting...', true, true);
      }
      else{
        displayErrorScreen(`An error occured: ${event.reason}`, true);
      }
    }
  }
}
connect();


async function displayQueue(){
  const queueDiv = document.getElementById('queueDiv');
  queueDiv.style.display = "";

  //delete
  //temporary wait in queue, for testing UI purposes
  // await new Promise(r => setTimeout(r, 2000));
  // queueDiv.style.display = "none";
}


function noConsultantsOnline(){
  displayErrorScreen('There are currently no consultants online. Working hours: 8:00 - 17:00.', true);
}


//called when we first connect to chat. Shows position in queue (doesnt update rn)
async function updateQueue(data){
  const queuePosition = document.getElementById('queue-position');

  queuePosition.innerText = data.payload.piq;
}


function startChat(data){
  const queueDiv = document.getElementById('queueDiv');
  queueDiv.style.display = "none";

  chatInProgress = true;
  consultantName = data.payload.first_name;
  
  //informs user that a consultant has connected
  const messages = document.getElementById('messages');
  let item = document.createElement('li');
  item.textContent = `Connected. You are chatting with ${data.payload.consultantName}.`;
  messages.appendChild(item);

  let hr = document.createElement('hr');
  item.parentNode.insertBefore(hr, item.nextSibling);

  window.scrollTo(0, document.body.scrollHeight);
}


//text message received from server
function messageReceived(receivedData){
  const messages = document.getElementById('messages');
  
  let item = document.createElement('li');
  let textDiv = document.createElement('span');
  textDiv.classList.add('consultant-message', 'messageDiv');


  textDiv.textContent = `Consultant: ${receivedData.payload.msg}`;
  item.appendChild(textDiv);
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);


  //timestamp stuff
  let timeStamp = document.createElement('div');

  const currentTime = getTimeStamp();
  timeStamp.innerText = currentTime;
  textDiv.appendChild(timeStamp);
  timeStamp.classList.add('timestamp');

  //notification if popup is closed
  window.parent.serverMessage();
}


//sends message to server, aswell as adding the HTML to the chat if successful
function sendMessage(){
  const textInput = document.getElementById('input');
  const charLength = document.getElementById('characterLength');
  let message = textInput.value;

  //dont send empty messages or messages that are too large
  if(message == '' || message.trim() == '' || message.length > characterLimit){
    return;
  }

  try{
    ws.send(JSON.stringify({
      event: 'MESSAGE',
      payload: {
        msg: message,
        event_sub_0: 'FROM-CLIENT'
      }
    }));
  }
  catch(err){
    //not sure if this is needed, ws.onerror will probably be called first
    console.log("Error occured while sending message: ", err);

    return;
  }

  charLength.innerText = '0/1000';
  textInput.value = '';

  const messages = document.getElementById('messages');
  let item = document.createElement('li');
  let textDiv = document.createElement('span');
  textDiv.classList.add('client-message', 'messageDiv');


  textDiv.textContent = name + ': ' + message;
  item.appendChild(textDiv);
  messages.appendChild(item);


  //timestamp
  let timeStamp = document.createElement('div');
  const currentTime = getTimeStamp();
  timeStamp.innerText = currentTime;
  textDiv.appendChild(timeStamp);
  timeStamp.classList.add('timestamp');

  messages.scrollTo(0, messages.scrollHeight);
}



//when the consultant closes the connection, we let the user know the chat has concluded and user action is disabled.
function endChat(){
    //informs user that a consultant has disconnected
    const messages = document.getElementById('messages');
    let item = document.createElement('li');
    item.textContent = `Chat concluded, the connection was closed.`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);

    let hr = document.createElement('hr');
    item.parentNode.insertBefore(hr, item.nextSibling);

    const inputField = document.getElementById('input');
    const sendButton = document.getElementById('send-message');

    inputField.setAttribute("disabled", "true");
    sendButton.setAttribute("disabled", "true");
}


//todo
//replace with animation
//shows when consultant is currently typing
async function typingNotice(){
  const messages = document.getElementById('messages');
  let item = document.createElement('li');
  item.innerText = `${consultantName} is typing a message...`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);

  await new Promise(r => setTimeout(() => { item.innerText = ''; r }, 2000));
}


function getTimeStamp(){
  const currentDate = new Date();
  let currentHours = ("0" + currentDate.getHours()).slice(-2);
  let currentMinutes = ("0" + currentDate.getMinutes()).slice(-2);

  const currentTime = `${currentHours}:${currentMinutes}`;

  return currentTime;
}
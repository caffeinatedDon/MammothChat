//Christian Code

if ("WebSocket" in window) {
    
    const btnConnect = document.querySelector('#btnConnect');//on login
    const btnDisconnect = document.querySelector('#btnDisconnect');//on log out

    const btnGrabNext = document.querySelector('#btnGrabNext');
    const btnEndChat = document.querySelector('#btnEndChat');
    const sendBtn = document.querySelector('#send');
    const messages = document.querySelector('#messages');
    const messageBox = document.querySelector('#messageBox');

    function showMessage(message) {
        if(typeof message === 'object'){
            if(message.auth=="FROM-CONSULTANT"){
                messages.innerHTML += `<div name="row" class="w-100 d-flex justify-content-start">
                <div name="message" class="w-50 m-4 mt-0">
                    <div name='message-body'
                        class=" text-start border border-light-subtle rounded-end rounded-bottom p-2"
                        style="background-color: #047dff;color: white;border: #047dff;">
                        <p class="m-0">${message.message}</p>
                    </div>
                    <div name="time-stamp" class="d-flex justify-content-end">
                        <p>9:30 am</p>
                    </div>
                </div>
            </div>`;
            }else{
                messages.innerHTML += `<div name="row" class="w-100 d-flex justify-content-end">
                <div name="message" class="w-50 m-3 mt-0">
                    <div name='message-body'
                        class=" text-start border border-light-subtle rounded-start rounded-bottom p-2"
                        style="background-color: #fafafa">
                        <p class="m-0">${message.message}</p>
                    </div>
                    <div name="time-stamp" class="d-flex justify-content-start">
                        <p>9:30 am</p>
                    </div>
                </div>
            </div>`;
            }
        }else{
            messages.innerHTML += `<div style="border:1px solid grey;padding:5px;margin:5px;">${message}</div>`;
        }
        messages.scrollTop = messages.scrollHeight;
        messageBox.value = '';
    }

    let ws;

    btnConnect.onclick = function () {
        ws = new WebSocket("ws://139.84.231.103:17152");
        ws.onopen = function () {
            console.log("Connected to Server");
            ws.send(JSON.stringify({
                event: "JOIN",
                payload: {
                    event_sub_0: 'CONSULTANT',
                    first_name: 'Christian',
                    last_name: 'Morgan',
                    email_address: 'christian.morgan@epiuse.com'
                }
            }));
        };
        if (ws) {
            document.querySelector('#btnConnect').disabled = true;
            document.querySelector('#btnDisconnect').disabled = false;
            document.querySelector('#btnGrabNext').disabled = false;
        }





        ws.onmessage = function ({ data }) {
            console.log(`${data}`);
            let receivedData = JSON.parse(data);
            let payload = JSON.parse(JSON.stringify(receivedData.payload));

            switch (receivedData.event) {
                // showMessage(`YOU: ${data}`);
                case 'NOTICE':
                    switch (payload.event_sub_0) {

                        case 'FIQ':
                            showMessage(`${payload.msg}`);
                            break;

                        case 'PIQ':
                            showMessage(`You are #${payload.piq} in the queue.`);
                            break;

                        case 'NO-CONSULTANTS-ONLINE':
                            showMessage(`${payload.msg}`);
                            showMessage(`These are your options available: ${payload.options[0]} or ${payload.options[1]}`);
                            break;

                        case 'JOIN_CONSULTANT':
                            showMessage(`🟢 Hi ${payload.first_name}! You have connected to the server (^_^)`);
                            break;

                        case 'GENERAL':
                            showMessage(`Hi ${payload.first_name} you are # ${payload.piq} in the queue (^_^)`);
                            break;

                        default:
                            console.log(`Unknown NOTICE event_sub_0 ${payload.event_sub_0}`);
                    }
                    break;


                case 'MESSAGE':
                    switch (payload.event_sub_0) {

                        case 'FROM-CLIENT':
                            showMessage({message:payload.msg,auth:payload.event_sub_0});
                            break;

                        case 'FROM-CONSULTANT':
                            showMessage({message:payload.msg,auth:payload.event_sub_0});
                            break;

                        case 'FROM-SERVER':
                            showMessage(`${payload.msg}`);
                            break;

                        default:
                            console.log(`Unknown MESSAGE event_sub_0`);
                    }
                    break;


                default:
                    console.log(`Unknown EVENT`);
            }
        };


        ws.onclose = function () {
            ws = null;
            alert("Connection closed... refresh to try again!");
        };


    }

    btnDisconnect.onclick = function () {
        if (ws) {
            ws.send(JSON.stringify({
                event: 'CLOSE'
            }));
            document.querySelector('#btnConnect').disabled = false;
            document.querySelector('#btnDisconnect').disabled = true;
            document.querySelector('#btnGrabNext').disabled = true;
            document.querySelector('#btnEndChat').disabled = true;
        }
    }

    btnGrabNext.onclick = function () {
        if (ws) {
            ws.send(JSON.stringify({
                event: 'QUEUE',
                payload: {
                    event_sub_0: 'GET_FIQ'
                }
            }));
            document.querySelector('#btnGrabNext').disabled = true;
            document.querySelector('#btnEndChat').disabled = false;
        }
    }

    btnEndChat.onclick = function () {
        if (ws) {
            document.querySelector('#btnGrabNext').disabled = false;
            document.querySelector('#btnEndChat').disabled = true;
        }
    }

    sendBtn.onclick = function () {
        if (ws) {

            //ws.send(messageBox.value);
            ws.send(JSON.stringify({
                event: 'MESSAGE',
                payload: {
                    event_sub_0: 'FROM-CONSULTANT',
                    msg: messageBox.value
                }
            }))
            //showMessage(`ME: ${messageBox.value}`);
        } else {
            alert("ERROR: Not connected... refresh to try again!");
        }
    }






} else {
    alert("WebSocket NOT supported by your Browser!");
}
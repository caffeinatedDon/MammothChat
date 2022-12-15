'use strict'
//cjs is evil ... 
require('dotenv').config()


const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
let apiFunctions = null;
(async () => {
  // Load the module, from which everything else follows
  apiFunctions = await import("../public/js/callFunctions.js")
  console.log("API functions:", apiFunctions);
})();


app.use(express.static(path.join(__dirname, "../public")));
var router = express.Router()
app.use('/', router)
app.use(express.json())

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../public") + '/index.html');
});

app.post('/createTicket', async (req, res) => {
  console.log(req.body);
  console.log("test click");

  let id = await apiFunctions.createTicket()

  // console.log("ID in server:", id);
  res.send({
    "id": id
  });
})

app.post('/updateTicket', async (req, res) => {
  console.log(req.body);
  console.log("id:",req.body.id,"message:",req.body.message);

  let stat = await apiFunctions.updateTicket(req.body.id,req.body.message)

  // console.log("ID in server:", id);
  res.send({
    "status": stat
  });
})

app.post("/getTicketInfo", async (req, res) => {
  
  let ticketID = req.body.id

  const message_arr = await apiFunctions.getTicketInfo(ticketID)

  res.send({
    "messages": message_arr
  });
})


io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ', msg);
    io.emit('chat message', msg);
  });
});


server.listen(3000, () => {
  console.log('Listening on *: 3000');
});
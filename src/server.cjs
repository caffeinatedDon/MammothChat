'use strict'
//cjs is evil ... 
require('dotenv').config()


const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
let apiFunctions = null;
let loginFunctions = null;
(async () => {
  // Load the module, from which everything else follows
  apiFunctions = await import("../public/js/callFunctions.js")
  loginFunctions = await import("../public/js/login.js")
  console.log("API functions:", apiFunctions);
  console.log("login functions:", loginFunctions);
})();

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, "../public")));
var router = express.Router()
app.use('/', router)
app.use(express.json())

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  console.log("Page has been requested");
  res.sendFile(path.join(__dirname, "../public") + '/index.html');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "../public/consultant/") + 'login.html');//Content-Security-Policy frame-ancestors 'self' http://localhost:3000
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, "../public/consultant/") + 'dashboard.html');
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, "../public/client/") + 'index.html');
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
  console.log("id:", req.body.id, "message:", req.body.message);

  let stat = await apiFunctions.updateTicket(req.body.id, req.body.message)

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

app.post("/loginpost", async (req, res) => {
  console.log(req);
  let username = req.body.username
  let pass = req.body.password
  console.log(req.body);
  const message = await loginFunctions.login(username, pass)
  console.log("DA MESSAGE", message);
  res.send({
    "value": message.value,
    "status":message.status
  })
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
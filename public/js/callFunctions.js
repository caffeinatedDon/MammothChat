import * as dotenv from 'dotenv'
dotenv.config()

import axios from "axios"

export async function createTicket() {
  var options = {
    url: 'https://' + process.env.INSTANCE + '.service-now.com/api/now/table/incident',
    method: 'POST',
    headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": ("Basic " + new Buffer(process.env.USER_NAME + ":" + process.env.PASSWORD).toString('base64')) },
    json: true,
    data: { 'short_description': "Ticket from MIT", 'description': 'Creating incident through Request', 'assignment_group': '', 'urgency': '2', 'impact': '2', "severity": "2" }
  };
  const response = await axios(options)

  // console.log(response);
  let loc = response.headers.location
  //console.log(loc);
  let locArr = loc.split("/")
  let id = locArr[locArr.length - 1]
  return id
}

export async function getTicketInfo(ticketID) {

  const response = await fetch(`https://${process.env.INSTANCE}.service-now.com/api/now/table/incident?sysparm_display_value=all&sys_id=${ticketID}`,
    { headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Basic " + new Buffer(process.env.USER_NAME + ":" + process.env.PASSWORD).toString('base64') } }
  )

  console.log("Status:", response.statusText);
  let txt = await response.text()
  let jsnDT = JSON.parse(txt);

  let arr = jsnDT.result[0]["comments"]["display_value"].split("\n")

  let message_arr = []
  let temp = []
  arr.forEach(item => {
    if (item == "") {
      if (temp[0] != undefined) {
        message_arr.push({ date: temp[0].split(" - ")[0].split(" ")[0], time: temp[0].split(" - ")[0].split(" ")[1], author: temp[0].split(" - ")[1].split(" (")[0], message: temp.slice(1, temp.length), msg_type: temp[0].split(" - ")[1].split(" (")[1].replace(")", "") })
        temp = []
      }

    } else {
      temp.push(item)
    }
  });

  console.log("message arr:", message_arr);
  return message_arr
}

export async function updateTicket(ticketID) {
  let response = await fetch(`https://${process.env.INSTANCE}.service-now.com/api/now/table/incident/${ticketID}`, {

    method: 'PATCH',

    headers: {

      'Accept': 'application/json',

      'Content-Type': 'application/json',

      'Authorization': 'Basic ' + btoa(`${process.env.USER_NAME}:${process.env.PASSWORD}`)

    },

    body: "{'assigned_to':'800b174138d089c868d09de320f9833b','urgency':'1','comments':'Client: Elevating urgency, this is a blocking issue'}"

  });
  console.log("res:", response);

  return "done"
}
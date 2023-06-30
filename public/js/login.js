import { sha256 } from "js-sha256";
import jsonData from "../../src/json/consultants.json" assert {type: 'json'}


export async function login(username, pass) {
    let returnStatus = 403
    let success = false
    let url = null

    let userArr = jsonData["users"]
    console.log("username", username);
    console.log("pass", pass);
    let hashed = sha256(pass)
    console.log(hashed);
    userArr.forEach(user => {
        if (user.username == username && user.password == hashed) {
            console.log("Successful")
            success = true
        } else {
            console.log("Stop forgetting your credentials");

        }
    });
    if (success) {
        returnStatus = 200
        url="/dashboard"
    } else {
        returnStatus = 403
    }

    return {
        value: url,
        status: returnStatus
    }
}
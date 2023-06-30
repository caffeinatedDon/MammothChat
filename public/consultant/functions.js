document.getElementById("login").addEventListener("click", async () => {
    let username = document.getElementById("username").value
    let password = document.getElementById("password").value

    let res = await fetch('/loginpost', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": username,
            "password": password
        })
    })
    let data = await res.json()
    console.log(data);
    if (data.status == 200) {
        console.log("In");
        window.location.href = "http://localhost:3000" + data.value
    }
})


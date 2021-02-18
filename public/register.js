let form = document.querySelector("form");
async function submitForm(options) {
  let send = await fetch("register", options);
  let response = await send.json();
  if (response.status === "ok") alert("Verification link sent to email");
  else alert(response.message);
  console.log(response);
}
form.onsubmit = (event) => {
  event.preventDefault();
  let username = document.getElementById("username").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  if (!email || !password || !username) {
    alert("Enter username, email and password");
    return;
  }
  if (password.length < 5) {
    alert("Password should have at least 5 characters");
    return;
  }
  let body = {
    username: username,
    email: email,
    password: password,
  };
  let options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  submitForm(options);
  console.log(`${email} ${password}`);
  form.reset();
};

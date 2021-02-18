let form = document.querySelector("form");
async function submitForm(options) {
  let send = await fetch("/login", options);
  if (send.redirected) {
    console.log("redirected");
    console.log(send);
    location.href = send.url;
  } else {
    let response = await send.json();
    if (response.status !== "ok") alert(response.message);
    console.log(response);
  }
}
form.onsubmit = async (event) => {
  event.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  if (!email || !password) {
    alert("Enter email and password");
    return;
  }
  if (password.length < 5) {
    alert("Password should have at least 5 characters");
    return;
  }
  let body = {
    email: email,
    password: password,
  };
  let options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify(body),
  };
  let req = await submitForm(options);
  form.reset();
};

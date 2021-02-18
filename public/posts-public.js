//Ham Menu
let hBtn = document.querySelector(".ham-btn");
let hMenu = document.querySelector(".ham-menu");
let hClose = document.querySelector(".ham-close");
hBtn.onclick = () => {
  hMenu.style.width = "400px";
};
hClose.onclick = () => {
  hMenu.style.width = 0;
};

//Fetching user details
let userLogo = document.getElementById("user-name");
let detailName = document.getElementById("details-name");
let detailEmail = document.getElementById("details-email");
let userQuery = getUser().then((user) => {
  userLogo.innerHTML = user.username ? user.username[0] : "U";
  detailName.innerHTML = user.username ? user.username : "User";
  detailEmail.innerHTML = user.username ? user.email : "User";
});

async function getUser() {
  let req = await fetch("/users");
  let user = await req.json();
  return user;
}

//Handling logout
let logout = document.getElementById("logout");
logout.onclick = async () => {
  let send = await fetch("/logout");
  if (send.redirected) location.href = send.url;
};

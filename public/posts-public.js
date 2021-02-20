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
let accountUser;
let userLogo = document.getElementById("user-name");
let detailName = document.getElementById("details-name");
let detailEmail = document.getElementById("details-email");
let userQuery = getUser().then((user) => {
  accountUser = user.username;
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

//Like Button
let likeBtns = document.querySelectorAll(".like-btn");
likeBtns.forEach((btn) => {
  btn.addEventListener("click", handleLikes);
});

function handleLikes(event) {
  let postAuthor = event.path[2].children[0].children[0].children[0].textContent.trim();
  if (postAuthor === accountUser) return;
  let likeCount =
    parseInt(event.path[0].parentElement.querySelector("p").textContent) + 1;
  console.log(event.path[0].parentElement);
  let likeDisplay = event.path[0].parentElement.querySelector("p");
  let postTime = event.path[2].children[0].children[0].children[1].textContent.trim();
  // console.log(postAuthor);
  // console.log(postTime);
  likeDisplay.textContent = likeCount;

  let likeData = {
    author: postAuthor,
    time: postTime,
    likeCount,
  };

  let postOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(likeData),
  };

  let send = fetch("/publicposts/updatelikes", postOptions)
    .then((response) => {
      return response.json();
    })
    .then((data) => console.log(data));
}

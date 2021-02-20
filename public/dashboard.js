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

//Fetching posts
let postList = document.getElementById("post-list");
fetch("/dashboard.html/posts")
  .then((result) => {
    return result.json();
  })
  .then((data) => {
    data.posts.forEach((post, index) => {
      let likeTag = "";
      if (post.likes || post.likes === 0) {
        likeTag = `<div style="font-size: 1rem">Likes: ${post.likes}</div>`;
      }
      let btnId = `deleteBtn:${index}`;
      postList.innerHTML += `<li><div><Strong>${accountUser}</strong></div> <div class="list-btn"><div>${post.post}</div><div><button type="button" class="btn-delete" id=${btnId}><svg id="svg-delete" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
        <path id="svg-path" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
      </svg></button></div></div>${likeTag}</li>`;
    });
  })
  .catch((err) => {
    console.log(err);
  });

//Delete posts
postList.onclick = async (event) => {
  console.log(event);
  console.log(event.path[0].id);
  if (
    event.path[0].id === "svg-path" ||
    event.path[0].id === "svg-delete" ||
    event.path[0].classList.contains("btn-delete")
  ) {
    let btnLevel;
    if (event.path[0].id === "svg-path") btnLevel = 2;
    else if (event.path[0].id === "svg-delete") btnLevel = 1;
    else btnLevel = 0;
    console.log(btnLevel);
    console.log(event.path[btnLevel].id.split(":")[1]);
    let body = {
      postIndex: event.path[btnLevel].id.split(":")[1],
    };
    let options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
    let send = await fetch("/dashboard.html/posts", options);
    let response = await send.json();
    console.log(response);
    if (response.status === "ok") location.reload();
  }
};
//Handling logout
let logout = document.getElementById("logout");
logout.onclick = async () => {
  let send = await fetch("/logout");
  if (send.redirected) location.href = send.url;
};

//Submitting posts
let userPost = document.getElementById("userPost");
userPost.onsubmit = async (event) => {
  event.preventDefault();
  let postBody = document.getElementById("postBody");
  let permission = document.getElementById("permission");
  if (postBody.value) {
    let body = {
      post: postBody.value,
      permission: permission.checked,
      time: new Date(),
      likes: 0,
    };
    console.log(body);
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };

    let send = await fetch("/dashboard.html/posts", options);
    let response = await send.json();
    console.log(response);
    userPost.reset();
    if (response.status === "ok") location.reload();
  }
};

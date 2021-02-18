const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const db = require("./db");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const app = express();

const mongoOptions = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const Client = new MongoClient(process.env.MONGO_URI, mongoOptions);
db.connectToDb(Client).then((res) => {
  console.log(res);
});

app.use(express.json());
app.use(cookieParser());

// Middlewares
function auth(req, res, next) {
  let token = req.cookies.jwtToken;
  // console.log(token);
  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.log(err.message);
  }

  if (user) {
    // console.log(user);
    return next();
  } else return res.redirect("/login.html");
}

function checkIfAuthorized(req, res, next) {
  let token = req.cookies.jwtToken;
  // console.log(token);
  if (!token) return next();
  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.log(err.message);
  }

  if (user) {
    return res.redirect("/dashboard.html");
  } else return next();
}

app.use("/dashboard.html", auth);
app.use("/publicposts", auth);
app.use("/login.html", checkIfAuthorized);
app.use("/register.html", checkIfAuthorized);
app.use("/index.html", checkIfAuthorized);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.post("/register", async (req, res) => {
  let data = req.body;
  let found = await db.findData(Client, data);

  if (found.present) {
    // console.log("Already Present");
    return res.json({
      status: "error",
      message: "Email already present",
    });
  } else {
    let { username, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    data = { username, email, password: hashedPassword };
    let id = await db.awaitVerification(Client, data);
    let tempToken = jwt.sign(
      { email: data.email, id: id },
      process.env.VERIFICATION_TOKEN
    );
    let verificationURL = `https://strangerthoughts.herokuapp.com/user/verify/${tempToken}`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "zleksquare@gmail.com",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    let emailInfo = await transporter.sendMail({
      from: "donot reply <zleksquare@gmail.com>",
      to: email,
      subject: "Verify Email",
      html: `<h3>Click on the link to verify your email and start using our application:</h2><br/><a href="${verificationURL}">Verification Link</a>`,
    });

    console.log(emailInfo);
    res.json({ status: "ok" });
  }
});

app.get("/user/verify/:verificationToken", async (req, res) => {
  let token = req.params.verificationToken;
  let { email, id } = jwt.verify(token, process.env.VERIFICATION_TOKEN);
  let found = await db.verify(Client, email);

  if (found) return res.redirect("/login.html");
  else return res.send("Not found");
});

app.post("/login", async (req, res) => {
  let data = req.body;
  let found = await db.findData(Client, data);
  // console.log(found);
  if (found.present) {
    if (found.passwordMatches) {
      console.log("about to redirect");
      let username = found.username;
      let signature = { username: username, email: data.email };
      let token = jwt.sign(signature, process.env.ACCESS_TOKEN);
      res.cookie("jwtToken", token, { httpOnly: true });
      // res.json({ token });
      return res.redirect("/dashboard.html");
    } else {
      res.json({ status: "error", message: "password incorrect" });
      return;
    }
  } else {
    res.json({ status: "error", message: "invalid email" });
  }
});

app.get("/users", (req, res) => {
  let token = req.cookies.jwtToken;
  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.error(err.message);
    return res.redirect(401, "/login.html");
  }

  res.json(user);
});

app.post("/dashboard.html/posts", async (req, res) => {
  console.log(req.body);
  // let { post, permission } = req.body;
  let post = req.body;
  let token = req.cookies.jwtToken;
  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.error(err);
    return res.json({ status: "error", message: err.message });
  }
  await db.updateData(Client, user.email, post);

  res.json({ status: "ok" });
});

app.get("/dashboard.html/posts", async (req, res) => {
  let token = req.cookies.jwtToken;
  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.error(err);
    return res.json({ status: "error", message: err.message });
  }

  let posts = await db.getPosts(Client, user.email);

  res.json({ posts });
});

app.delete("/dashboard.html/posts", async (req, res) => {
  let token = req.cookies.jwtToken;
  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.error(err);
    return res.json({ status: "error", message: err.message });
  }
  let deleteQuery = await db.deletePost(Client, user.email, req.body);

  res.json({ status: "ok" });
});

app.get("/publicposts", async (req, res) => {
  let publicPosts = await db.getPublicPosts(Client);
  // console.log(publicPosts);
  res.render("posts-public", { posts: publicPosts });
  // res.json({ status: "ok" });
});

app.get("/logout", (req, res) => {
  res.cookie("jwtToken", "", { httpOnly: true, maxAge: 1 });
  res.redirect("/login.html");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

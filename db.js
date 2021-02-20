require("mongodb");
const bcrypt = require("bcryptjs");
async function connectToDb(Client) {
  try {
    await Client.connect();
    let res = "connected to db";
    return res;
  } catch (err) {
    console.error(err);
    return err;
  }
}

async function awaitVerification(Client, data) {
  try {
    let newUser = await Client.db("Profile_App")
      .collection("Unverified Profiles")
      .insertOne(data);
    return newUser.insertedId;
  } catch (err) {
    console.error(err);
    return;
  }
}

async function verify(Client, email) {
  try {
    let user = await Client.db("Profile_App")
      .collection("Unverified Profiles")
      .findOne({ email: email });
    if (user) {
      console.log("Unverified profile now verified");
      await insertData(Client, user);
      await Client.db("Profile_App")
        .collection("Unverified Profiles")
        .deleteOne({ email: email });

      return true;
    } else {
      console.log("user not found as an unverified profile");
      return false;
    }
  } catch (err) {
    console.error(err);
    return;
  }
}

async function insertData(Client, data) {
  try {
    await Client.db("Profile_App").collection("Profiles").insertOne(data);
    return;
  } catch (err) {
    console.error(err);
    return;
  }
}

async function updateData(Client, user, post) {
  try {
    let query = await Client.db("Profile_App")
      .collection("Profiles")
      .updateOne(
        { email: user },
        { $push: { posts: { $each: [post], $position: 0 } } }
      );
    console.log(query.matchedCount);
    console.log("updated");
    return;
  } catch (err) {
    console.error(err);
    return;
  }
}

async function getPosts(Client, user) {
  try {
    let query = await Client.db("Profile_App")
      .collection("Profiles")
      .findOne({ email: user });
    let posts = query.posts;
    return posts ? posts : "No posts yet";
  } catch (error) {
    console.error(error);
    return;
  }
}

async function findData(Client, { email, password }) {
  try {
    let query = await Client.db("Profile_App")
      .collection("Profiles")
      .findOne({ email: email });
    if (query) {
      // console.log(query);
      return (await bcrypt.compare(password, query.password))
        ? { present: true, passwordMatches: true, username: query.username }
        : { present: true, passwordMatches: false };
    } else {
      // console.log("not found");
      return { present: false, passwordMatches: false };
    }
  } catch (err) {
    console.error(err);
    return;
  }
}

async function deletePost(Client, user, { postIndex }) {
  console.log("The index is:", postIndex);
  try {
    let query = await Client.db("Profile_App")
      .collection("Profiles")
      .findOne({ email: user });
    let posts = query.posts;
    let deletePost = posts.splice(postIndex, 1);
    let update = await Client.db("Profile_App")
      .collection("Profiles")
      .updateOne({ email: user }, { $set: { posts: posts } });
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getPublicPosts(Client) {
  let cursor = await Client.db("Profile_App").collection("Profiles").find({});
  let userPosts = await cursor.toArray();

  let timePosts = [];
  userPosts.forEach((post) => {
    let username = post.username;
    if (post.posts && post.posts.length > 0) {
      for (note of post.posts) {
        note.permission &&
          timePosts.push({
            username,
            thisPost: note.post,
            time: note.time,
            likes: note.likes,
          });
      }
    }
  });

  for (let i = 0; i < timePosts.length; i++) {
    for (let j = i + 1; j < timePosts.length; j++) {
      if (timePosts[j].time > timePosts[i].time) {
        let temp = timePosts[i];
        timePosts[i] = timePosts[j];
        timePosts[j] = temp;
      }
    }
  }

  return timePosts;
}

async function updateLikes(Client, data) {
  let user = await Client.db("Profile_App")
    .collection("Profiles")
    .updateOne(
      { username: data.author, posts: { $elemMatch: { time: data.time } } },
      { $set: { "posts.$.likes": data.likeCount } }
    );
  console.log(user.matchedCount);
}

module.exports = {
  awaitVerification,
  verify,
  connectToDb,
  insertData,
  findData,
  updateData,
  getPosts,
  deletePost,
  getPublicPosts,
  updateLikes,
};

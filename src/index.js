console.clear();
const mingoose = require("./mingoose");
const path = require("path");

mingoose.connect(path.join(__dirname, "../db"));

const userSchema = new mingoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const User = mingoose.model("Users", userSchema);

console.log(User);

async function test1() {
  const stagedUser = new User({
    name: "Eric",
    age: 27,
    email: "dave@email.com",
  });
  const user = await stagedUser.save();
  const found = await User.findById(user._id);
  console.log(found);
  found.name = "Eric got updated";
  const updatedUser = await User.updateById(found._id, found);
  console.log(updatedUser);
}

// test1();
async function test2() {
  const user = await User.create({
    name: "Dave",
    age: 27,
    email: "itslit@hi.org",
  });
  console.log("New User: ", user);

  const found = await User.findById(user._id);
  console.log("Found User: ", found);
  found.email = "floopydoo@email.net";
  const updated = await User.updateById(user._id, found);
  console.log("Updated User: ", updated);
}

// test2();

const postSchema = new mingoose.Schema({
  title: {
    required: true,
  },
  owner: {
    required: true,
    fk: "Users",
  },
});

const Post = mingoose.model("Posts", postSchema);

async function test3() {
  const user = await User.create({
    name: "post maker",
    email: "imakeposts@gmail.com",
  });

  console.log(user);

  const post = await Post.create({
    title: "new post",
    owner: user._id,
  });

  console.log(post);

  const populatedPost = await Post.populate(post, "owner");
  console.log(populatedPost);
}

test3();

// test2();

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
  _related: {
    posts: {
      from: "Posts",
      field: "owner",
    },
  },
});

const User = mingoose.model("Users", userSchema);

async function test1() {
  const stagedUser = new User({
    name: "Eric",
    age: 27,
    email: "dave@email.com",
  });
  const user = await stagedUser.save();
  const found = await User.findById(user._id);
  found.name = "Eric got updated";
  const updatedUser = await User.updateById(found._id, found);
}

// test1();
async function test2() {
  const user = await User.create({
    name: "Dave",
    age: 27,
    email: "itslit@hi.org",
  });

  const found = await User.findById(user._id);
  found.email = "floopydoo@email.net";
  const updated = await User.updateById(user._id, found);
}

// test2();

const postSchema = new mingoose.Schema({
  title: {
    required: true,
  },
  owner: {
    type: "reference",
    required: true,
    from: "Users",
  },
});

const Post = mingoose.model("Posts", postSchema);

async function test3() {
  const user = await User.create({
    name: "post maker",
    email: "imakeposts@gmail.com",
  });

  const post = await Post.create({
    title: "new post",
    owner: user._id,
  });

  await Post.create({
    title: "another new post",
    owner: user._id,
  });

  await Post.create({
    title: "a third post by this guy",
    owner: user._id,
  });

  const populatedPost = await Post.populate(post, "owner");
  console.log(populatedPost);

  const myPosts = await User.getRelated(user, "posts");
  console.log(myPosts);
}

test3();

// test2();

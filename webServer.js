/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();

const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const MongoStore = require("connect-mongo");
const passwordUtils = require("./password");

const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
//const x = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(
  session({
    secret: "secretKey", // Replace "secretKey" with a secure, randomly generated key
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Helps protect against XSS attacks
      maxAge: 1000 * 60 * 60 * 24, // Session expiration time (1 day)
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1/project6", // Store session data in MongoDB
      collectionName: "sessions", // Collection name for sessions
    }),
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

function isAuthenticated(request, response, next) {
  if (request.session && request.session.user) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    response.status(401).send('Unauthorized'); // User is not authenticated
  }
}

/**
 * URL /user/list - Returns all the User objects.
 */
/* app.get("/user/list", async function (request, response) {
  try {
    const users = await User.find({}, "_id first_name last_name").exec();
    return response.status(200).json(users);
  } catch (error) {
  console.error("Error fetching user list:", error);
  return response.status(500).send("Internal server error");
  }
}); */

app.get("/user/list", isAuthenticated, async function (request, response) {
  try {
    const userCounts = await User.aggregate([
      {
        $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "user_id",
          as: "photos",
        },
      },
      {
        $addFields: {
          photoCount: { $size: "$photos" },
        },
      },
      {
        $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "comments.user_id",
          as: "commentedPhotos",
        },
      },
      {
        $addFields: {
          // Count all comments made by the user on photos (including duplicates)
          commentCount: {
            $sum: {
              $map: {
                input: "$commentedPhotos",
                as: "photo",
                in: {
                  $size: {
                    $filter: {
                      input: "$$photo.comments",
                      as: "comment",
                      cond: { $eq: ["$$comment.user_id", "$_id"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          photoCount: 1,
          commentCount: 1,
        },
      },
    ]);

    return response.status(200).json(userCounts);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return response.status(500).send("Internal server error");
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", isAuthenticated, async function (request, response) {
  const userId = request.params.id;

  // Validate the ID format before querying the database
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("Invalid user ID format:", userId);
    return response.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(userId, "_id first_name last_name location description occupation").exec();
    
    if (user) {
      console.log("User found:", userId);
      return response.status(200).json(user);
    } else {
      console.log("User not found:", userId);
      return response.status(400).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", isAuthenticated, async function (request, response) {
  const userId = request.params.id;

  // Validate the ID format before querying the database
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("Invalid user ID format:", userId);
    return response.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const photos = await Photo.find({ user_id: userId }).populate("likes")
      .sort({ likes: -1, date_time: -1 })
      .exec();
    
    if (!photos || photos.length === 0) {
      console.log("No photos found for user:", userId);
      return response.status(400).json({ error: "No photos found for this user" });
    }

    const photoDetails = await Promise.all(
      photos.map(async (photo) => {
        const commentsWithUserDetails = await Promise.all(
          photo.comments.map(async (comment) => {
            try {
              const user = await User.findById(comment.user_id, "_id first_name last_name").exec();
              return {
                comment: comment.comment,
                date_time: comment.date_time,
                _id: comment._id,
                user: user ? { _id: user._id, first_name: user.first_name, last_name: user.last_name } : null,
              };
            } catch (commentError) {
              console.error("Error fetching user for comment:", commentError.message);
              return null;
            }
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: commentsWithUserDetails.filter((comment) => comment !== null),
          likes: photo.likes,
        };
      })
    );

    console.log("Photos found for user:", userId);
    return response.status(200).json(photoDetails);
  } catch (error) {
    console.error("Error:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

/**
 * URL /user/:id/comments - Returns all comments made by a specific user (id).
 */
app.get("/user/:id/comments", isAuthenticated, async function (request, response) {
  const userId = request.params.id;

  // Validate the ID format before querying the database
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("Invalid user ID format:", userId);
    return response.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    // Find all photos where the user has commented
    const photos = await Photo.find(
      { "comments.user_id": userId },
      "_id file_name comments user_id"
    ).exec();

    // Filter and map the comments to include the photo thumbnail and comment text
    const userComments = [];

    photos.forEach((photo) => {
      const photoComments = photo.comments.filter(
        (comment) => comment.user_id.toString() === userId
      );

      photoComments.forEach((comment) => {
        userComments.push({
          photoThumbnail: photo.file_name,  // Assuming file_name is the image filename
          commentText: comment.comment,
          photoId: photo._id,
          commentId: comment._id,
          photoUserId: photo.user_id,
          dateTime: comment.date_time,
        });
      });
    });

    if (userComments.length === 0) {
      console.log("No comments found for user:", userId);
      return response.status(400).json({ error: "No comments found for this user" });
    }

    console.log("Comments found for user:", userId);
    return response.status(200).json(userComments);

  } catch (error) {
    console.error("Error fetching user comments:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

app.post('/admin/login', async function (request, response) {
  const { login_name, password } = request.body;

  try {
    const user = await User.findOne({ login_name });
    if (!user || !user.password_digest || !user.salt || 
        !passwordUtils.doesPasswordMatch(user.password_digest, user.salt, password)) {
      return response.status(400).send({ error: 'Invalid login name or password' });
    }

    request.session.user = { _id: user._id, first_name: user.first_name };
    return response.status(200).send({ _id: user._id, first_name: user.first_name });
  } catch (err) {
    return response.status(500).send({ error: 'Internal server error' });
  }
});

app.post("/commentsOfPhoto/:photo_id", async function (request, response) {
  const photoId = request.params.photo_id;

  // Validate the photo ID format
  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return response.status(400).json({ message: "Invalid photo ID format" });
  }

  // Validate the comment in the request body
  const { comment } = request.body;
  if (!comment || typeof comment !== 'string' || comment.trim() === "") {
    return response.status(400).json({ message: "Comment cannot be empty" });
  }

  // Check if the user is logged in (ensure user_id is available in the session)
  if (!request.session.user) {
    return response.status(401).json({ message: "User must be logged in to add a comment" });
  }

  try {
    // Find the photo by ID
    const photo = await Photo.findById(photoId).exec();
    if (!photo) {
      return response.status(404).json({ message: "Photo not found" });
    }

    // Create the new comment object
    const newComment = {
      comment: comment.trim(),
      user_id: request.session.user._id, // Get the logged-in user's ID from the session
      date_time: new Date(),
    };

    // Add the comment to the photo's comments array
    photo.comments.push(newComment);

    // Save the updated photo document
    await photo.save();

    // Respond with the updated photo's comments array (instead of the entire photo)
    return response.status(200).json({ comments: photo.comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    return response.status(500).json({ message: "Internal server error" });
  }
});

app.post("/photos/new", processFormBody, async function (req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const timestamp = new Date().valueOf(); // Unique timestamp for filename
    const filename = 'U' + timestamp + "_" + req.file.originalname; // Create unique file name
    const filePath = path.join(__dirname, "images", filename); // Path to save file

    await fs.promises.writeFile(filePath, req.file.buffer);

    // After successful file save, insert into the database
    const newPhoto = new Photo({
      file_name: filename,
      user_id: req.session.user._id, // Get user ID from session
      comments: [],
      date_time: new Date(),
    });

    const savedPhoto = await newPhoto.save();

    // Respond with success message
    return res.status(200).json({
      message: "Photo uploaded and saved successfully",
      photo: savedPhoto,
    });
  } catch (err) {
    console.error("Error during upload or save:", err);

    // Handle specific errors
    if (err.code === "ENOENT") {
      return res.status(500).json({ message: "Directory not found or inaccessible" });
    }

    // General error response
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/admin/logout', async function(request, response) {
  if (!request.session.user) {
    return response.status(400).send('No user is logged in');
  }

  try {
    await new Promise((resolve, reject) => {
      request.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    response.clearCookie('connect.sid');
    return response.status(200).send('Logged out');
  } catch (err) {
    return response.status(500).send('Error logging out');
  }
});

app.use((request, response, next) => {
  if (request.path.startsWith('/admin/login') || request.path === '/user') {
    next();
    return;
  }
  
  if (!request.session.user) {
    response.status(401).send('Unauthorized');
    return;
  }
  
  next();
});

app.post('/user', async function (request, response) {
  const { first_name, last_name, description, occupation, location, login_name, password } = request.body;

  if (!first_name || !last_name || !login_name || !password) {
    return response.status(400).send({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).send({ error: 'Login name already exists.' });
    }

    const { salt, hash } = passwordUtils.makePasswordEntry(password);

    const newUser = new User({
      first_name,
      last_name,
      description,
      occupation,
      location,
      login_name,
      password_digest: hash,
      salt,
    });

    await newUser.save();
    return response.status(200).send({ message: 'User registered successfully.', login_name: newUser.login_name });
  } catch (error) {
    console.error('Error registering user:', error);
    return response.status(500).send({ error: 'Internal server error.' });
  }
});

app.post('/photo/:photoId/like', async (request, response) => {
  const { photoId } = request.params;
  const userId = request.body.userId; // Pass userId in the request body
  console.log("Like", photoId);
  console.log("Like2", userId);

  try {
    // Fetch the photo by ID
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return response.status(404).send({ error: "Photo not found" });
    }

    let userLiked = false;
    // Loop through the likes array and check if the user has already liked the photo
    for (let i = 0; i < photo.likes.length; i++) {
      if (photo.likes[i].user_id.toString() === userId) {
        userLiked = true;
        break;
      }
    }

    if (userLiked) {
      // Unlike the photo: remove the like object for this user
      photo.likes = photo.likes.filter(like => like.user_id.toString() !== userId);
    } else {
      // Like the photo: add a new like object
      photo.likes.push({ user_id: userId });
    }

    // Save the updated photo document
    await photo.save();

    // Return the updated like count
    return response.status(200).send({ likes: photo.likes.length });
  } catch (err) {
    console.error("Error handling like/unlike request:", err);
    return response.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/photo/:photoId", isAuthenticated, async function (request, response) {
  const photoId = request.params.photoId;
  const userId = request.session.user._id; // Current logged-in user

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return response.status(400).json({ error: "Invalid photo ID format" });
  }

  try {
    const photo = await Photo.findById(photoId).exec();
    if (!photo) {
      return response.status(404).json({ error: "Photo not found" });
    }
    if (!photo.user_id.equals(userId)) {
      return response.status(403).json({ error: "Not authorized to delete this photo" });
    }

    await Photo.deleteOne({ _id: photoId });
    return response.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/commentsofPhotos/:photoId/:commentId", isAuthenticated, async function (request, response) {
  const { photoId, commentId } = request.params;
  const userId = request.session.user._id; // Logged-in user's ID

  if (!mongoose.Types.ObjectId.isValid(photoId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return response.status(400).json({ error: "Invalid photo or comment ID format" });
  }

  try {
    // Find the photo by ID and ensure the comment exists
    const photo = await Photo.findById(photoId).exec();
    if (!photo) {
      return response.status(404).json({ error: "Photo not found" });
    }

    // Find the index of the comment in the comments array
    const commentIndex = photo.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return response.status(404).json({ error: "Comment not found" });
    }

    // Check if the logged-in user is the owner of the comment
    if (!photo.comments[commentIndex].user_id.equals(userId)) {
      return response.status(403).json({ error: "Not authorized to delete this comment" });
    }

    // Remove the comment by index
    photo.comments.splice(commentIndex, 1);

    // Save the updated photo document
    await photo.save();
    return response.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/user/:id", isAuthenticated, async function (request, response) {
  const userId = request.params.id;

  // Ensure the user is authorized to delete the account
  if (userId !== request.session.user._id.toString()) {
    return response.status(403).json({ error: "Not authorized to delete this account" });
  }

  try {
    // Delete all photos by the user
    await Photo.deleteMany({ user_id: userId });

    // Remove user's comments from all photos
    await Photo.updateMany({}, { $pull: { comments: { user_id: userId } } });

    // Delete the user account
    await User.deleteOne({ _id: userId });

    // Destroy the user's session and logout
    return new Promise((resolve) => {
      request.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return resolve(response.status(500).json({ error: "Failed to delete session" }));
        }
        response.clearCookie('connect.sid');
        return resolve(response.status(200).json({ message: "User account deleted successfully" }));
      });
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
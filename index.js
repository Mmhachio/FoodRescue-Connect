// Import required modules
const express = require("express"); // Express web framework
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const ejs = require("ejs"); // Templating engine
const app = express(); // Create an Express application
const mongoose = require("mongoose"); // MongoDB ODM

// Configure Express settings
app.use(express.static("public")); // Serve static files from the "public" directory
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.use(bodyParser.urlencoded({
  extended: true
})); // Use bodyParser middleware to parse request bodies

// Connect to the userDB database for users
const userDB = mongoose.createConnection('mongodb://127.0.0.1:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
userDB.on('error', console.error.bind(console, 'User DB Connection error:'));
userDB.once('open', () => {
  console.log('Connected to userDB');
});

// Define a schema and model for users in the userDB
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  address: String,
  phoneno: String
});

const User = userDB.model("User", userSchema);

// Connect to the ngoDB database for NGOs
const ngoDB = mongoose.createConnection('mongodb://127.0.0.1:27017/ngoDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

ngoDB.on('error', console.error.bind(console, 'NGO DB Connection error:'));
ngoDB.once('open', () => {
  console.log('Connected to ngoDB');
});

// Define a schema and model for NGOs in the ngoDB
const ngoSchema = new mongoose.Schema({
  email: String,
  password: String,
  ngoname: String,
  address: String,
  phoneno: String
});

const Ngo = ngoDB.model("Ngo", ngoSchema);

// Connect to the foodDB database for food items
const foodDB = mongoose.createConnection('mongodb://127.0.0.1:27017/foodDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

foodDB.on('error', console.error.bind(console, 'Food DB Connection error:'));
foodDB.once('open', () => {
  console.log('Connected to foodDB');
});

// Define a schema and model for food items in the foodDB
const foodSchema = new mongoose.Schema({
  Foodname: String,
  quantity: Number,
  expiryDate: Date,
  userPhoneNo: String,
  userName: String,
  userAddress: String
});

const Food = foodDB.model("Food", foodSchema);

// Homepage route
app.get("/", function(req, res) {
  res.render("home");
});

// Login page route
app.get("/login", function(req, res) {
  res.render("login");
});

// Register page route for users
app.get("/userregister", function(req, res) {
  res.render("userregister");
});

// Register a user route
app.post("/registeruser", async function(req, res) {
  const newUser = new User({
    email: req.body.useremail,
    password: req.body.userpassword,
    username: req.body.username,
    address: req.body.useraddress,
    phoneno: req.body.userphone
  });

  try {
    const savedUser = await newUser.save();
    console.log('User saved');

    // Fetch the newly saved user from the database
    const user = await User.findOne({
      _id: savedUser._id
    }).exec();

    // Pass the 'user' object to the 'userpage' template
    res.render("userpage", {
      user: user
    });
  } catch (err) {
    console.error(err);
  }
});

// Register page route for NGOs
app.get("/ngoregister", function(req, res) {
  res.render("ngoregister");
});

// Register an NGO route
app.post("/registerngo", async function(req, res) {
  const newNgo = new Ngo({
    email: req.body.ngoemail,
    password: req.body.ngopassword,
    ngoname: req.body.ngoname,
    address: req.body.ngoaddress,
    phoneno: req.body.phoneno
  });

  try {
    const savedNgo = await newNgo.save();
    console.log('Ngo saved');

    // Fetch the newly saved NGO from the database
    const ngo = await Ngo.findOne({
      _id: savedNgo._id
    }).exec();

    // Pass the 'ngo' object to the 'ngopage' template
    res.render("ngopage", {
      ngo: ngo
    });
  } catch (err) {
    console.error(err);
  }
});
// Add a new food item route
app.post("/addfood", async function (req, res) {
  const {
    foodName,
    quantity,
    expiryDate,
    userEmail,
    userPhonenumber,
    userName,
    userAddress,
  } = req.body;

  try {
    // Create a new Food object
    const newFood = new Food({
      Foodname: foodName,
      quantity: quantity,
      expiryDate: expiryDate,
      userPhoneNo: userPhonenumber,
      userName: userName,
      userAddress: userAddress,
    });

    // Save the food item to the database
    const savedFood = await newFood.save();
    console.log('Food item saved');

    // Redirect to the user page with a success message
    res.redirect("/userpage?success=true");
  } catch (err) {
    console.error(err);
    // Handle error and redirect to the previous page with an error message if needed
    res.redirect("/userpage?error=true");
  }
});
// Retrieve all food items route
app.get("/fooditems", async function(req, res) {
  try {
    const foodItems = await Food.find().exec();
    res.render("fooditems", {
      foodItems: foodItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
//user register
app.post("/submituser", async function(req, res) {
  const user_email = req.body.userEmail;
  const user_password = req.body.userPassword;

  try {
    // Find a user with the provided email
    const user = await User.findOne({
      email: user_email
    }).exec();

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Compare the provided password with the stored password
    if (user.password === user_password) {
      // Passwords match, user is authenticated
      res.render("userpage", {
        user: user
      });
    } else {
      // Passwords don't match, authentication failed
      return res.status(401).send("Authentication failed");

    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});
//ngo submit route
app.post("/submitngo", async function(req, res) {
  const ngo_email = req.body.ngoEmail;
  const ngo_password = req.body.ngoPassword;

  try {
    // Find an NGO with the provided email
    const ngo = await Ngo.findOne({
      email: ngo_email
    }).exec();

    if (!ngo) {
      return res.status(404).send("NGO not found");
    }

    // Compare the provided password with the stored password
    if (ngo.password === ngo_password) {
      // Passwords match, NGO is authenticated
      // Pass the 'ngo' object to the 'ngopage' template
      return res.render("ngopage", {
        ngo: ngo
      });
    } else {
      // Passwords don't match, authentication failed
      return res.status(401).send("Authentication failed");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");

  }
});
//admin user submit route
const adminEmail = "admin@123.com";
const adminPassword = "Admin@1234";
app.post("/submitadmin", (req, res) => {
  const {
    email,
    password
  } = req.body;

  // Check if the provided email and password match the admin credentials
  if (email === adminEmail && password === adminPassword) {
    // Admin authentication successful
    res.render("adminpage"); // Render the admin page
  } else {
    // Admin authentication failed
    res.status(401).send("Authentication failed");
  }
});
// Start the Express server
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

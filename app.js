// Import required modules
const express = require("express"); // Express web framework
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const ejs = require("ejs"); // Templating engine
const app = express(); // Create an Express application
const mongoose = require("mongoose"); // MongoDB ODM
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/miniproject/food/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
app.use('/miniproject/food', express.static('C:/miniproject/food'));
// Set up multer for handling file uploads
const upload = multer({ storage: storage });
// Configure Express settings
app.use(express.static("public")); // Serve static files from the "public" directory
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.use(bodyParser.urlencoded({
  extended: true
})); // Use bodyParser middleware to parse request bodies
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key', // Replace with your secret key
  resave: false,
  saveUninitialized: false
}));

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
  description: String,  // Add a description field
  quantity: Number,
  expiryDate: Date,
  userPhoneNo: String,
  userName: String,
  userAddress: String,
  status: String,
  imageUrl: String // Add this line for image URL
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
//aboutpage route
app.get("/about", function(req, res) {
  res.render("aboutpage");
});

app.get("/collaboration", function(req, res) {
  res.render("collabpage");
});
app.get("/contact", function(req, res) {
  res.render("contactpage");
});

// Register page route for users
app.get("/userregister", function(req, res) {
  res.render("userregister", { message: "   " });
});
app.get("/ngoregister", function(req, res) {
  res.render("ngoregister", { message: "   " });
});
//user register route
app.post("/registeruser", async function (req, res) {
  const email = req.body.useremail;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email: email }).exec();

    if (existingUser) {
      // If the email is found in the database, send a message indicating that the user is already registered
      const message = "User with this email is already registered.";
      res.render("userregister", { message: message }); // Render the registration page with the message
    } else {
      // If the email is not found, create and save the new user
      const newUser = new User({
        email: email,
        password: req.body.userpassword,
        username: req.body.username,
        address: req.body.useraddress,
        phoneno: req.body.userphone,
      });

      const savedUser = await newUser.save();
      console.log('User saved');

      // Fetch the newly saved user from the database
      const user = await User.findOne({ _id: savedUser._id }).exec();

      // Redirect to the login page or render a success message
      res.render("login", { user: user });
    }
  } catch (err) {
    console.error(err);
  }
});

// Register page route for NGOs
app.post("/registerngo", async function(req, res) {
  const email = req.body.ngoemail;

  try {
    // Check if the email is already registered
    const existingNgo = await Ngo.findOne({ email: email }).exec();

    if (existingNgo) {
      // If the email is found in the database, send a message indicating that the user is already registered
      const message = "NGO with this email is already registered.";
      res.render("ngoregister", { message: message }); // Render the registration page with the message
    } else {
      // If the email is not found, create and save the new NGO
      const newNgo = new Ngo({
        email: email,
        password: req.body.ngopassword,
        ngoname: req.body.ngoname,
        address: req.body.ngoaddress,
        phoneno: req.body.phoneno
      });

      const savedNgo = await newNgo.save();
      console.log('NGO saved');

      // Fetch the newly saved NGO from the database
      const ngo = await Ngo.findOne({ _id: savedNgo._id }).exec();

      // Redirect to the login page or render a success message
      res.render("login", { ngo: ngo });
    }
  } catch (err) {
    console.error(err);
  }
});

// Add a new food item route
app.post("/addfood", upload.single('foodImage'), async function (req, res) {
  console.log("File uploaded:", req.file);
  const {
    foodName,
    description,
    quantity,
    expiryDate,
    userPhonenumber,
    userName,
    userAddress,
    status,
  } = req.body;

  // Get the filename of the uploaded file
  const imageUrl = req.file ? '/miniproject/food/' + req.file.filename : null;

  try {
    // Create a new Food object with the imageUrl and description
    const newFood = new Food({
      Foodname: foodName,
      description: description,
      quantity: quantity,
      expiryDate: expiryDate,
      userPhoneNo: userPhonenumber,
      userName: userName,
      userAddress: userAddress,
      status: status,
      imageUrl: imageUrl,
    });

    // Save the food item to the database
    const savedFood = await newFood.save();
    console.log('Food item saved');

    // Redirect to the UserAddedFoodItems page with the user's name as a query parameter
    res.redirect(`/UserAddedFoodItems?userName=${encodeURIComponent(userName)}`);
  } catch (err) {
    console.error(err);
    // Handle error and redirect to the previous page with an error message if needed
    res.redirect("/userpage?error=true");
  }
});


app.post("/checkmyfooditems", async function (req, res) {
    const userName = req.body.userName; // Extract userName from the request body

    // Redirect to the /UserAddedFoodItems route with the userName parameter
    res.redirect(`/UserAddedFoodItems?userName=${encodeURIComponent(userName)}`);
});

app.get("/UserAddedFoodItems", async function(req, res) {
  // Check if the user is authenticated
  if (!req.session.user) {
    // Redirect to the login page or display an error message
    return res.redirect("/login"); // Change "/login" to your actual login route
  }

  const userName = req.query.userName; // Get the user's name from the query parameter

  try {
    // Fetch and filter the food items added by the user from the foodDB
    const userAddedFoodItems = await Food.find({ userName: userName }).exec();

    // Render the UserAddedFoodItems page and pass the user's added food items
    res.render("UserAddedFoodItems", {
      userAddedFoodItems: userAddedFoodItems,
      user: { username: userName } // Pass the user's name to the template
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// route for deleting food items
app.post("/deletefooduser", async function(req, res) {
  const foodItemId = req.body.foodItemId;
  const userName = req.body.userName; // Extract the user's name from the form

  try {
    // Find and delete the food item by its ID
    const deletedFood = await Food.findByIdAndRemove(foodItemId).exec();

    if (!deletedFood) {
      return res.status(404).send("Food item not found");
    }

    // Redirect back to the UserAddedFoodItems page after deletion
    res.redirect(`/UserAddedFoodItems?userName=${encodeURIComponent(userName)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
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
// Route for the user page, protected by authentication middleware
app.get("/userpage", function(req, res) {
  if (!req.session.user) {
    // If the user is not authenticated, redirect to the login page
    return res.redirect("/login");
  }

  // If the user is authenticated, render the user page
  res.render("userpage", {
    user: req.session.user
  });
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
      req.session.user = user; // Set the user session
      return res.redirect("/userpage"); // Redirect to the user page
    } else {
      // Passwords don't match, authentication failed
      return res.status(401).render("login", { error: "Authentication failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

// User Logout route
app.get("/userlogout", function(req, res) {
  // Clear the user session
  req.session.user = null;

  // Redirect to the homepage or any other appropriate page
  res.redirect("/");
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
      // Store the authenticated NGO in the session
      req.session.ngo = ngo;

      // Redirect to the NGO dashboard or any other appropriate page
      return res.redirect("/ngopage"); // Change to your NGO dashboard route
    } else {
      // Passwords don't match, authentication failed
      return res.status(401).send("Authentication failed");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});
//ngopage route
app.get("/ngopage", async function(req, res) {
  // Check if the NGO is authenticated
  if (!req.session.ngo) {
    // Redirect to the login page or display an error message
    return res.redirect("/login"); // Change to your login route
  }

  try {
    // Fetch all food items from the database
    const foodItems = await Food.find().exec();

    // If the NGO is authenticated, render the NGO dashboard
    res.render("ngopage", {
      ngo: req.session.ngo,
      foodItems: foodItems // Pass the foodItems variable to the template
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});
//POST route to book food items
app.post("/bookfood", async function (req, res) {
  const { foodItemId, status } = req.body;

  // Check if the food item is already booked
  if (status === "Booked") {
    // If already booked, send a message
    return res.send("This food item is already booked.");
  }

  try {
    // Update the status of the food item to "Booked"
    await Food.findByIdAndUpdate(foodItemId, { status: "Booked" }).exec();
    console.log('Food item booked');

    // Redirect back to the ngopage
    res.redirect("/ngopage");
  } catch (err) {
    console.error(err);
    // Handle error and redirect to the previous page with an error message if needed
    res.redirect("/ngopage?error=true");
  }
});

//ngo logout
app.get("/ngologout", function(req, res) {
  // Clear the NGO session
  req.session.ngo = null;

  // Redirect to the homepage or any other appropriate page
  res.redirect("/");
});

//admin user submit route
const adminEmail = "admin@123.com";
const adminPassword = "Admin@1234";

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    // User is an admin, proceed to the next middleware or route handler
    next();
  } else {
    // Admin authentication failed, redirect or show an error message
    res.status(403).send("Unauthorized");
  }
};
// Route that requires admin authentication
app.get("/admin", isAdmin, async function(req, res) {
  try {
    // Your admin-specific code here
    res.render("adminpage");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route for admin login
app.post("/adminlogin", async function(req, res) {
  const adminEmailInput = req.body.email; // Change this to the email field name in your form
  const adminPasswordInput = req.body.password; // Change this to the password field name in your form

  // Check if the provided email and password match the admin credentials
  if (adminEmailInput === adminEmail && adminPasswordInput === adminPassword) {
    req.session.isAdmin = true; // Set a session variable to indicate admin authentication
    res.redirect("/admin"); // Redirect to the admin page
  } else {
    // Admin authentication failed, redirect or show an error message
    res.status(401).render("login", { error: "Authentication failed" });
  }
});
app.get("/adminlogout", function(req, res) {
  req.session.isAdmin = false; // Clear the admin session variable
  res.redirect("/"); // Redirect to the home page or any other appropriate page
});

// Retrieve all food items route
app.get("/fooditemsadmin", isAdmin, async function(req, res) {
  try {
    // Fetch all food items from the database
    const foodItems = await Food.find().exec();

    // Render a page and pass the retrieved food items as a variable
    res.render("fooditems", {
      foodItems: foodItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a food item route
app.post("/deletefood", async function(req, res) {
  const foodItemId = req.body.foodItemId; // Get the food item ID from the form submission

  try {
    // Find and delete the food item by its ID
    await Food.findByIdAndRemove(foodItemId).exec();
    console.log('Food item deleted');

    // Redirect back to the food items page after deletion
    res.redirect("/fooditemsadmin");
  } catch (err) {
    console.error(err);
    // Handle error and redirect to the previous page with an error message if needed
    res.redirect("/fooditemsadmin?error=true");
  }
});
// Check User and NGO Info route for admin
app.get("/checkinfoadmin", isAdmin, async function(req, res) {
  try {
    // Fetch user and NGO information from the respective collections
    const users = await User.find().exec();
    const ngos = await Ngo.find().exec();

    // Render an HTML page to display the user and NGO information
    res.render("allinfo", { users: users, ngos: ngos });
  } catch (err) {
    console.error(err);
    // Handle error and redirect to the previous page with an error message if needed
    res.redirect("/checkinfoadmin?error=true");
  }
});

// Add a POST route to remove a user
app.post("/removeuser", async function(req, res) {
  const userIdToRemove = req.body.userId; // Get the user ID from the request body

  try {
    // Remove the user based on the user ID
    await User.findByIdAndRemove(userIdToRemove).exec();
    console.log(`User with ID ${userIdToRemove} removed successfully.`);
    // Redirect to a page or send a response as needed
    res.redirect("/checkinfoadmin"); // Redirect to the admin page or any other appropriate page
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Add a POST route to remove an NGO
app.post("/removengo", async function(req, res) {
  const ngoIdToRemove = req.body.ngoId; // Get the NGO ID from the request body

  try {
    // Remove the NGO based on the NGO ID
    await Ngo.findByIdAndRemove(ngoIdToRemove).exec();
    console.log(`NGO with ID ${ngoIdToRemove} removed successfully.`);
    // Redirect to a page or send a response as needed
    res.redirect("/checkinfoadmin"); // Redirect to the admin page or any other appropriate page
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Express server
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

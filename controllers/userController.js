const bcrypt = require("bcrypt");
const User = require("../modals/userModal");
const Transaction = require("../modals/transactionModal");
const authHelpers = require("../helpers/auth");
const { uploadFileToS3 } = require("../helpers/s3Upload");
async function registerUser(req, res) {
  try {
    const { username, name, password, email, phone, location } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarFile = req.file;
    if (avatarFile) {
      var avatarUrl = await uploadFileToS3(avatarFile);
    }
    // Save the user to the database
    const user = new User({
      username,
      name,
      email,
      phone,
      location,
      password: hashedPassword,
      avatar: avatarUrl,
      // Assuming you store the S3 file URL in the 'location' property
    });
    const userData = await user.save();
    const token = authHelpers.generateToken(userData._id);
    res
      .status(201)
      .json({ message: "User registered successfully", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}
async function updateUser(req, res) {
  try {
    const {
      name,
      email,
      phone,
      location,
      about,
      linkedin,
      facebook,
      insta,
      designation,
      password,
    } = req.body;
    const { id } = req.params;
    // Check if the username already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(409).json({ message: "User not exists" });
      return;
    }

    // Save the user to the database

    existingUser.name = name || existingUser.name;
    existingUser.email = email || existingUser.email;
    existingUser.phone = phone || existingUser.phone;
    existingUser.location = location || existingUser.location;
    existingUser.about = about || existingUser.about;
    existingUser.linkedin = linkedin || existingUser.linkedin;
    existingUser.facebook = facebook || existingUser.facebook;
    existingUser.insta = insta || existingUser.insta;
    existingUser.designation = designation || existingUser.designation;
    existingUser.password = password || existingUser.password;


    const userData = await existingUser.save();
    const token = authHelpers.generateToken(userData._id);
    res
      .status(201)
      .json({ message: "User registered successfully", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}
async function updateAvatar(req, res) {
  try {
    const { id } = req.params;
    // Check if the username already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(409).json({ message: "User not exists" });
      return;
    }
    const avatarFile = req.file;
    if (avatarFile) {
      var avatarUrl = await uploadFileToS3(avatarFile);
    }
    // Save the user to the database
    existingUser.avatar = avatarUrl;
    const userData = await existingUser.save();
    res.status(201).json({ message: "successfull", userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}
async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });

    // If user not found or password doesn't match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    // Generate a new JWT token using the helper function
    const token = authHelpers.generateToken(user._id);

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to login" });
  }
}
async function getUsers(req, res) {
  try {
    // Find the user in the database
    const user = await User.find();
    // Generate a new JWT token using the helper function
    res.json({ message: "Registered User", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No Users" });
  }
}
async function getUserByName(req, res) {
  try {
    // Find the user in the database
    var { name } = req.params;
    const user = await User.findOne({ username: name });
    console.log(user);
    if (user) {
      if (user.paymentStatus) {
        res.json({ message: "Registered User", user });
      } else {
        res.json({ message: "Complete Your Payment" });
      }
    } else {
      res.json({ message: "User mot found" });
    }
    // Generate a new JWT token using the helper function
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "No Users" });
  }
}
async function updatePayment(req, res) {
  try {
    const { paymentStatus } = req.body;
    const { id } = req.params;
    // Check if the username already exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      res.status(409).json({ message: "User not exists" });
      return;
    }

    // Save the user to the database

    if (paymentStatus === true) {
      existingUser.paymentStatus = true;
      const transaction = new Transaction({
        user: existingUser._id,
        currency: "inr",
        amount: 1500.0,
        // Assuming you store the S3 file URL in the 'location' property
      });
      await transaction.save();
    } else {
      existingUser.paymentStatus = false;
    }
    const userData = await existingUser.save();
    const token = authHelpers.generateToken(userData._id);
    res
      .status(201)
      .json({ message: "User registered successfully", token, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register user" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserByName,
  updateUser,
  updateAvatar,
  updatePayment,
};

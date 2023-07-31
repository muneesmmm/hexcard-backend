// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authHelpers = require("./helpers/auth");
const userController = require("./controllers/userController");
const categoryController = require("./controllers/categoryController");
const transactionController = require("./controllers/transactionController");
const uploadHelper = require("./helpers/s3Upload");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 80;

app.use(
  cors({
    origin: "https://hexcard.hexpeak.co.in", // Replace with your frontend's origin URL
    allowedHeaders: ["Content-Type", "Authorization"], // Add any additional headers you want to allow
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using Mongoose
mongoose
  .connect(
    "mongodb+srv://munees:123458@hexpeak.cpln38x.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Routes
// app.use(authHelpers.authenticateToken);
app.post(
  "/register",
  uploadHelper.upload.single("avatar"),
  userController.registerUser
);

app.post("/login", userController.loginUser);
app.post("/get-users", userController.getUsers);
app.post("/update/:id", userController.updateUser);
app.post("/update-payment/:id", userController.updatePayment);
app.post("/update-avatar/:id",uploadHelper.upload.single("avatar"), userController.updateAvatar);
app.get("/protected", authHelpers.authenticateToken, (req, res) => {
  // Access the authenticated user using req.user
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
app.post("/add-category", categoryController.addCategory);
app.post("/get-category", categoryController.getCategory);
app.post("/get-category/:id", categoryController.getCategoryById);
app.post("/delete-category/:id", categoryController.deleteCategoryById);
// app.post("/add-transactions", transactionController.addTransaction);
app.post("/get-transactions", transactionController.getTransaction);
app.post("/get-transactions/:id", transactionController.getTransactionById);
app.post("/create-payment", transactionController.createPayment);
app.post("/create-paymentintent", transactionController.createPaymentIntent);
app.post("/payment-confirm", transactionController.addTransaction);
app.post("/:name", userController.getUserByName);
app.post(
  "/delete-transactions/:id",
  transactionController.deleteTransactionById
);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

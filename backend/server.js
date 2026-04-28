const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = "mysecretkey";

mongoose.connect("mongodb://127.0.0.1:27017/pharmacyDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

// Define all schemas and models first
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // "patient" or "pharmacy"
  name: String
});

const User = mongoose.model("User", userSchema);

const medicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  pharmacy: String,
  distance: Number
});

const Medicine = mongoose.model("Medicine", medicineSchema);

const orderSchema = new mongoose.Schema({
  name: String,
  price: Number,
  pharmacy: String,
  status: String
});

const Order = mongoose.model("Order", orderSchema);

// Define middleware functions
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(403).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

app.post("/add-medicine",
  verifyToken,
  allowRoles("pharmacy"),
  async (req, res) => {
    const newMed = new Medicine(req.body);
    await newMed.save();
    res.json({ message: "Medicine added" });
});

app.post("/add-order",
  verifyToken,
  allowRoles("patient"),
  async (req, res) => {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ message: "Order placed" });
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.put("/update-order/:id",
  verifyToken,
  allowRoles("pharmacy"),
  async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });
    res.json({ message: "Order updated" });
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();
    const trimmedName = name?.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedName || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ❌ Block admin from normal registration
    if (role === "admin") {
      return res.status(403).json({ message: "Admin cannot be registered here" });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    const user = new User({
      email: trimmedEmail,
      password: hashedPassword,
      name: trimmedName,
      role,
    });

    await user.save();

    res.json({ message: "User registered" });

  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/create-admin", async (req, res) => {
  const { email, password, name } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new User({
    email,
    password: hashedPassword,
    name,
    role: "admin",
  });

  await admin.save();

  res.json({ message: "Admin created" });
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trim inputs
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    // Validate
    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user by email only
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔐 Compare hashed password
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🎟️ Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/analytics",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {

    const totalUsers = await User.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalOrders = await Order.countDocuments();

    const pending = await Order.countDocuments({ status: "Pending" });
    const accepted = await Order.countDocuments({ status: "Accepted" });
    const rejected = await Order.countDocuments({ status: "Rejected" });

    res.json({
      totalUsers,
      totalMedicines,
      totalOrders,
      statusData: {
        pending,
        accepted,
        rejected,
      }
    });
});

app.get("/users",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const { search = "", role = "" } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const SECRET = "mysecretkey";

mongoose.connect("mongodb://127.0.0.1:27017/pharmacyDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/add-medicine", async (req, res) => {
  const newMed = new Medicine(req.body);
  await newMed.save();
  res.json({ message: "Saved to DB" });
});

app.get("/medicines", async (req, res) => {
  const meds = await Medicine.find();
  res.json(meds);
});

app.post("/add-order", async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  res.json({ message: "Order saved" });
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.put("/update-order/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  res.json({ message: "Order updated" });
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // "patient" or "pharmacy"
  name: String
});

const User = mongoose.model("User", userSchema);

const bcrypt = require("bcrypt");

app.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Trim inputs
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();
    const trimmedName = name?.trim();

    // Validate fields
    if (!trimmedEmail || !trimmedPassword || !trimmedName || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Create user
    const user = new User({
      email: trimmedEmail,
      password: hashedPassword, // ✅ secure
      name: trimmedName,
      role,
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET = "mysecretkey";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- DB ---------------- */
mongoose.connect("mongodb://127.0.0.1:27017/pharmacyDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ---------------- SOCKET.IO (FIXED POSITION) ---------------- */
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

/* ---------------- SCHEMAS ---------------- */
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  name: String,
  address: String,
  city: String,
  state: String,
  coords: String,
});

const User = mongoose.model("User", userSchema);

const medicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  pharmacyId: String,
  pharmacyName: String,

  // ✅ structured location (FIXED)
  location: {
    city: String,
    state: String,
    address: String,
  },

  description: String,
  image: String,
});

const Medicine = mongoose.model("Medicine", medicineSchema);

const orderSchema = new mongoose.Schema({
  userId: String,
  pharmacyId: String,
  name: String,
  price: Number,
  status: { type: String, default: "Pending" },
  city: String,
  state: String,
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

/* ---------------- MIDDLEWARE ---------------- */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Invalid token" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token expired" });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Access denied" });
  next();
};

app.post("/add-medicine", verifyToken, allowRoles("pharmacy"), async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: "All fields required" });
    }

    const med = new Medicine({
      name,
      price,
      stock,
      pharmacyId: String(req.user.id),
      pharmacyName: req.user.name,

      // ✅ FULL LOCATION SAVED
      location: {
        city: (req.user.city || "").trim().toLowerCase(),
        state: req.user.state || "",
        address: req.user.address || "",
      },
    });

    await med.save();
    res.json({ message: "Medicine added ✅" });

  } catch (err) {
    console.error("ADD MED ERROR:", err);
    res.status(500).json({ message: "Error adding medicine" });
  }
});
/* ---------------- ROUTES ---------------- */

// ADD MEDICINE (only pharmacy)
app.get("/medicines", verifyToken, async (req, res) => {
  try {
    let meds;

    // 🔹 PHARMACY
    if (req.user.role === "pharmacy") {
      meds = await Medicine.find({
        pharmacyId: String(req.user.id),
      });
    }

    // 🔹 PATIENT
    else {
      const city = (req.query.city || "").trim().toLowerCase();

      const query = city
        ? { "location.city": city }   // ✅ FIXED
        : {};

      meds = await Medicine.find(query);
    }

    res.json(meds);

  } catch (err) {
    console.error("MEDICINES ERROR:", err);
    res.status(500).json({ message: "Error fetching medicines" });
  }
});

// ADD ORDER (FIXED)
app.post("/add-order", verifyToken, async (req, res) => {
  try {
    const { name, price, pharmacyId } = req.body;

    const order = new Order({
      userId: req.user.id,
      pharmacyId,
      name,
      price,
      city: req.user.city,
      state: req.user.state,
    });

    await order.save();
    res.json({ message: "Order placed" });

  } catch {
    res.status(500).json({ message: "Error placing order" });
  }
});

// GET ORDERS
app.get("/orders", verifyToken, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "pharmacy") {
      orders = await Order.find({ pharmacyId: req.user.id });
    } else {
      orders = await Order.find({ userId: req.user.id });
    }

    res.json(orders);

  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// UPDATE ORDER
app.put("/update-order/:id",
  verifyToken,
  allowRoles("pharmacy"),
  async (req, res) => {
    try {
      const updated = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );

      io.emit("orderUpdated", updated);

      res.json({ message: "Order updated" });

    } catch {
      res.status(500).json({ message: "Error updating order" });
    }
  }
);

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password, name, role, address, city, state, coords } = req.body;

    if (!email || !password || !name || !role)
      return res.status(400).json({ message: "All fields required" });

    if (role === "admin")
      return res.status(403).json({ message: "Admin not allowed" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      name,
      role,
      address,
      city,
      state,
      coords,
    });

    await user.save();
    res.json({ message: "Registered" });

  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN (FIXED CITY)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

   const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    name: user.name,
    city: user.city,
    state: user.state,
  },
  SECRET,
  { expiresIn: "1h" }
);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        city: user.city,
        state: user.state,
      },
    });

  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});



app.get("/analytics",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
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
        },
      });

    } catch {
      res.status(500).json({ message: "Analytics error" });
    }
  }
);

app.get("/users",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {
    try {
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
        pages: Math.ceil(total / limit),
      });

    } catch {
      res.status(500).json({ message: "Error fetching users" });
    }
  }
);

app.post("/create-admin", async (req, res) => {
  try {
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

  } catch {
    res.status(500).json({ message: "Admin creation failed" });
  }
});
/* ---------------- START SERVER ---------------- */
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
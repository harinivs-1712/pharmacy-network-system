
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

/* ---------------- SOCKET ---------------- */
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



// ✅ USER (UPDATED)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  name: String,

  location: {
    city: String,
    state: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    }
  }
});

const User = mongoose.model("User", userSchema);

// ✅ MEDICINE (UPDATED)
const medicineSchema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  pharmacyId: String,
  pharmacyName: String,

  location: {
    city: String,
    state: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    }
  },

  description: String,
  image: String,
});

const Medicine = mongoose.model("Medicine", medicineSchema);

// ✅ ORDER
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

/* ---------------- UTILITY ---------------- */

// 🔥 Distance calculation (for nearest pharmacy)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* ---------------- ROUTES ---------------- */

// ✅ REGISTER
app.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      role,
      address,
      city,
      state,
      coords
    } = req.body;

    if (!email || !password || !name || !role)
      return res.status(400).json({ message: "All fields required" });

    //if (role === "admin")
      //return res.status(403).json({ message: "Admin not allowed" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      name,
      role,
      location: {
        address,
        city: (city || "").toLowerCase(),
        state,
        coordinates: coords // { lat, lng }
      }
    });

    await user.save();
    res.json({ message: "Registered" });

  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
});

// ✅ LOGIN
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
        city: user.location?.city,
        state: user.location?.state,
        coordinates: user.location?.coordinates,
        address: user.location?.address
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
        city: user.location?.city,
        state: user.location?.state
      }
    });

  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ ADD MEDICINE
app.post("/add-medicine", verifyToken, allowRoles("pharmacy"), async (req, res) => {
  try {
    const { name, price, stock, description, image } = req.body;

    const med = new Medicine({
      name,
      price,
      stock,
      description,
      image,

      pharmacyId: String(req.user.id),
      pharmacyName: req.user.name,

      location: {
        city: (req.user.city || "").toLowerCase(),
        state: req.user.state,
        address: req.user.address,
        coordinates: req.user.coordinates
      }
    });

    await med.save();
    res.json({ message: "Medicine added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding medicine" });
  }
});

// ✅ GET MEDICINES (with nearest sorting)
app.get("/medicines", verifyToken, async (req, res) => {
  try {
    let meds;

    // 🏪 If pharmacy → only their medicines
    if (req.user.role === "pharmacy") {
      meds = await Medicine.find({ pharmacyId: req.user.id });
    } 
    // 👤 If patient → get all + sort by nearest
    else {
      const city = (req.query.city || "").toLowerCase();

      let query = city ? { "location.city": city } : {};
      meds = await Medicine.find(query);

      // ✅ Debug (optional)
      console.log("USER:", req.user.coordinates);

      // 🔥 Add distance + sort
      if (req.user.coordinates) {
        meds = meds.map((m) => {
          if (!m.location?.coordinates) {
            return {
              ...m._doc,
              distance: null
            };
          }

          const distance = calculateDistance(
            req.user.coordinates.lat,
            req.user.coordinates.lng,
            m.location.coordinates.lat,
            m.location.coordinates.lng
          );

          return {
            ...m._doc,
            distance: Number(distance.toFixed(2))
          };
        });

        // 🔥 Sort by nearest
        meds.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }
    }

    res.json(meds);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching medicines" });
  }
});

// ✅ PLACE ORDER
app.post("/add-order", verifyToken, async (req, res) => {
  try {
    const { name, price, pharmacyId } = req.body;

    const order = new Order({
      userId: req.user.id,
      pharmacyId,
      name,
      price,
      city: req.user.city,
      state: req.user.state
    });

    await order.save();
    res.json({ message: "Order placed" });

  } catch {
    res.status(500).json({ message: "Error placing order" });
  }
});

// ✅ GET ORDERS
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

// ✅ UPDATE ORDER
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

// ✅ ANALYTICS
app.get("/analytics", verifyToken, allowRoles("admin"), async (req, res) => {
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
      statusData: { pending, accepted, rejected }
    });

  } catch {
    res.status(500).json({ message: "Analytics error" });
  }
});

// ✅ USERS (ADMIN)
app.get("/users", verifyToken, allowRoles("admin"), async (req, res) => {
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

    const users = await User.find(query).skip(skip).limit(limit);
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
});

/*----CART STARTS HERE---*/
const cartSchema = new mongoose.Schema({
  userId: String,
  pharmacyId: String,

  items: [
    {
      medicineId: String,
      name: String,
      price: Number,
      quantity: Number,
    }
  ],

  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", cartSchema);

app.post("/cart/add", verifyToken, async (req, res) => {
  try {
    const { medicineId, name, price, pharmacyId, quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        pharmacyId,
        items: [
          {
            medicineId,
            name,
            price,
            quantity: quantity || 1,
          },
        ],
      });
    } else {
      if (cart.pharmacyId !== pharmacyId) {
        return res.status(400).json({
          message: "Cart must be from one pharmacy",
        });
      }

      const item = cart.items.find(
        (i) => i.medicineId === medicineId
      );

      if (item) {
        item.quantity += quantity || 1;
      } else {
        cart.items.push({
          medicineId,
          name,
          price,
          quantity: quantity || 1,
        });
      }
    }

    await cart.save();
    res.json({ message: "Added to cart" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cart error" });
  }
});

app.get("/cart", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { items: [] });
});

app.put("/cart/update/:medicineId", verifyToken, async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });

  const item = cart.items.find(i => i.medicineId === req.params.medicineId);

  if (item) {
    item.quantity = quantity;
  }

  await cart.save();
  res.json(cart);
});

app.delete("/cart/remove/:medicineId", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });

  cart.items = cart.items.filter(i => i.medicineId !== req.params.medicineId);

  await cart.save();
  res.json(cart);
});

app.post("/cart/checkout", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart empty" });
  }

  const total = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const order = new Order({
    userId: req.user.id,
    pharmacyId: cart.pharmacyId,
    items: cart.items,
    totalAmount: total,
    status: "Pending"
  });

  await order.save();

  // clear cart
  await Cart.deleteOne({ userId: req.user.id });

  res.json({ message: "Order placed", order });
});


bcrypt.hash("admin123", 10).then(console.log);
/* ---------------- START SERVER ---------------- */
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
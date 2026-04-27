const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Temporary storage
let medicines = [];

// Add medicine
app.post("/add-medicine", (req, res) => {
  medicines.push(req.body);
  res.json({ message: "Medicine added" });
});

// Get medicines
app.get("/medicines", (req, res) => {
  res.json(medicines);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
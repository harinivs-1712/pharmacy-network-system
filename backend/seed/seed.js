const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://nehamfeb21_db_user:Neha$123@cluster0.cwuhrba.mongodb.net/pharmacyDB?retryWrites=true&w=majority");

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

const pharmacyLocations = [
  ["Apollo Pharmacy Whitefield", "Whitefield", 12.9698, 77.7499],
  ["MedPlus Marathahalli", "Marathahalli", 12.9591, 77.6974],
  ["NetMeds Partner Indiranagar", "Indiranagar", 12.9784, 77.6408],
  ["Guardian Pharmacy Koramangala", "Koramangala", 12.9352, 77.6245],
  ["Wellness Forever HSR Layout", "HSR Layout", 12.9116, 77.6474],
  ["Apollo Pharmacy Jayanagar", "Jayanagar", 12.9250, 77.5938],
  ["MedPlus Malleshwaram", "Malleshwaram", 13.0035, 77.5706],
  ["NetMeds Partner Electronic City", "Electronic City", 12.8456, 77.6603]
];

const medicines = [
  "Paracetamol 500mg","Azithromycin 250mg","Cetirizine 10mg","Amoxicillin 500mg",
  "Ibuprofen 400mg","Dolo 650","Pantoprazole 40mg","Omeprazole 20mg",
  "Metformin 500mg","Glimipride 2mg","Telmisartan 40mg","Amlodipine 5mg",
  "Atorvastatin 10mg","Rosuvastatin 10mg","Vitamin C Tablets","Zincovit",
  "Becosules","Crocin Advance","Benadryl Syrup","Ascoril Syrup",
  "Digene Tablets","ENO","ORS Sachet","Volini Spray","Moov Cream",
  "Disprin","Montek LC","Levocetirizine","Allegra 120","Nicip Plus",
  "Cofsils Lozenges","Betadine Gargle","Calpol 650","Sinarest","Nasal Spray",
  "Combiflam","Meftal Spas","Loperamide","Ondansetron","Rantac",
  "Clavam 625","Augmentin","Duphaston","Shelcal 500","Revital H",
  "Protein Powder","Insulin Pen","Glucon D","Electral Powder","Band Aid Pack"
];

async function seedData() {
  await Medicine.deleteMany({});

  const data = medicines.map((med, index) => {
    const pharmacy = pharmacyLocations[index % pharmacyLocations.length];

    return {
      name: med,
      price: Math.floor(Math.random() * 400) + 20,
      stock: Math.floor(Math.random() * 150) + 10,
      pharmacyId: "6a04561fedf7349e89a61cf2",
      pharmacyName: "Neha M",
      location: {
        city: "Bangalore",
        state: "Karnataka",
        address: pharmacy[1],
        coordinates: {
          lat: pharmacy[2],
          lng: pharmacy[3]
        }
      },
      description: `${med} available at nearest pharmacy`,
      image: "https://via.placeholder.com/150"
    };
  });

  await Medicine.insertMany(data);

  console.log("50 medicines inserted successfully");
  mongoose.connection.close();
}

seedData();
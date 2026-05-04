import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/register";
import PatientDashboard from "./pages/PatientDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/Admin";
import MedicineDetails from "./pages/MedicineDetails";
function App() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);

  return (
    <>
      <Toaster position="top-right" />
      
        <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/pharmacy"
          element={
            <PharmacyDashboard
              orders={orders}
              setOrders={setOrders}
              medicines={medicines}
              setMedicines={setMedicines}
            />
          }
        />

         
<Route path="/cart" element={<Cart />} />
        <Route
          path="/patient"
          element={
            <PatientDashboard
              medicines={medicines}
              orders={orders}
              setOrders={setOrders}
            />
          }
        />
<Route path="/medicine/:id" element={<MedicineDetails />} />
        <Route
          path="/orders"
          element={<Orders orders={orders} />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Routes>
    </Router>
      
    </>
    
  );
}

export default App;
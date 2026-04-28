import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/register";
import PatientDashboard from "./pages/PatientDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/Admin";

function App() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);

  return (
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
  );
}

export default App;
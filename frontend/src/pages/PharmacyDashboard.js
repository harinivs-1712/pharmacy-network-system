import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchMedicines();
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  
const fetchMedicines = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/medicines", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("STATUS:", res.status); // 👈 ADD THIS

  const data = await res.json();
  console.log("DATA:", data); // 👈 ADD THIS

  setMedicines(data);
};

const fetchOrders = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  setOrders(data);
};

  // 🔹 Update Order Status
  const updateStatus = async (id, status) => {
  const token = localStorage.getItem("token");
console.log("TOKEN:", token);
console.log("USER:", JSON.parse(localStorage.getItem("user")));
  try {
    const res = await fetch(`http://localhost:5000/update-order/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    console.log("STATUS CODE:", res.status);

    const data = await res.json();
    console.log("RESPONSE:", data);

    if (!res.ok) {
      alert("Update failed ❌");
      return;
    }

    // update UI
    setOrders((prev) =>
      prev.map((o) =>
        o._id === id ? { ...o, status } : o
      )
    );
  } catch (err) {
    console.error(err);
  }
};

  // 🔹 Add Medicine
  const addMedicine = async () => {
  const token = localStorage.getItem("token");

  const newMed = {
    name,
    price: Number(price),
    stock: Number(stock),
  };

  try {
    const res = await fetch("http://localhost:5000/add-medicine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newMed),
    });

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      alert(data.message || "Failed ❌");
      return;
    }

    alert("Added ✅");
    fetchMedicines();

    setName("");
    setPrice("");
    setStock("");

  } catch (err) {
    console.error(err);
    alert("Error ❌");
  }
};
console.log("Medicines:", medicines);
  // 🔹 Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pharmacy Dashboard 🏪</h1>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ADD MEDICINE */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-2">Add Medicine</h2>

        <input
          value={name}
          placeholder="Medicine Name"
          className="border p-2 mr-2"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          value={price}
          placeholder="Price"
          className="border p-2 mr-2"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          value={stock}
          placeholder="Stock"
          className="border p-2 mr-2"
          onChange={(e) => setStock(e.target.value)}
        />

        <button
          onClick={addMedicine}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* MEDICINES LIST */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">Your Medicines 💊</h2>

        {medicines
  .filter((m) => m.pharmacyId === String(user._id))
  .map((m) => (
    <div key={m._id} className="bg-white p-3 rounded shadow mb-2">
      {m.name} - ₹{m.price} (Stock: {m.stock})
    </div>
))}
      </div>

      {/* ORDERS */}
      <h2 className="text-xl font-bold mb-4">Incoming Orders 📦</h2>

      {orders.length === 0 ? (
        <p>No incoming orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{order.name}</h2>
                <p>₹{order.price}</p>
                <p className="text-sm text-gray-500">
                  Status: {order.status}
                </p>
              </div>

              {/* ACTIONS */}
              {order.status === "Pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(order._id, "Accepted")}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => updateStatus(order._id, "Rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    order.status === "Accepted"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {order.status === "Accepted" ? "✅ Accepted" : "❌ Rejected"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PharmacyDashboard;

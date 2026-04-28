import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));

    fetch("http://localhost:5000/medicines")
      .then((res) => res.json())
      .then((data) => setMedicines(data));
  }, []);

  const updateStatus = async (id, status) => {
  await fetch(`http://localhost:5000/update-order/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  // refresh
  const res = await fetch("http://localhost:5000/orders");
  const data = await res.json();
  setOrders(data);
};

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

const token = localStorage.getItem("token");

if (!token) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Add Medicine Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-2">Add Medicine</h2>

        <input
          placeholder="Medicine Name"
          className="border p-2 mr-2"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price"
          className="border p-2 mr-2"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Stock"
          className="border p-2 mr-2"
          onChange={(e) => setStock(e.target.value)}
        />

        <button
          onClick={async () => {
            const newMed = {
              name,
              price: Number(price),
              stock: Number(stock),
              pharmacy: user.name,
              distance: Math.floor(Math.random() * 5) + 1,
            };

            await fetch("http://localhost:5000/add-medicine", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newMed),
            });

            const medsRes = await fetch("http://localhost:5000/medicines");
            const medsData = await medsRes.json();
            setMedicines(medsData);

            alert("Medicine added to backend!");
          }}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Show Medicines */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">Your Medicines 💊</h2>

        {medicines.length === 0 ? (
          <p>No medicines added</p>
        ) : (
          medicines.map((m, i) => (
            <div key={i} className="bg-white p-3 rounded shadow mb-2">
              {m.name} - ₹{m.price} (Stock: {m.stock})
            </div>
          ))
        )}
      </div>

      {/* Orders Section */}
      <h1 className="text-2xl font-bold mb-4">
        Pharmacy Orders 🏪
      </h1>

      {orders.length === 0 ? (
        <p>No incoming orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{order.name}</h2>
                <p>₹{order.price}</p>
              </div>

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
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default PharmacyDashboard;

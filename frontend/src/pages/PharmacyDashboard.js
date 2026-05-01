import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");



  useEffect(() => {
    fetchOrders();
    fetchMedicines();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchMedicines = async () => {
    try {
      const res = await fetch("http://localhost:5000/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMedicines(data);

    } catch (err) {
      console.error(err);
    }
  };



  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setOrders(data);

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- ORDER UPDATE ---------------- */

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/update-order/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        toast.error("Update failed");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status } : o
        )
      );

      toast.success(`Order ${status}`);

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- ADD MEDICINE ---------------- */

  const addMedicine = async () => {
    if (!name || !price || !stock) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/add-medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }

      toast.success("Medicine added");

      fetchMedicines();
      setName("");
      setPrice("");
      setStock("");

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

    if (!token) return <Navigate to="/" />;

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
        <h2 className="font-bold mb-3">Your Medicines 💊</h2>

        {medicines.length === 0 ? (
          <p>No medicines added</p>
        ) : (
          medicines.map((m) => (
            <div
              key={m._id}
              className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between"
            >
              <div>
                <h2 className="font-semibold">{m.name}</h2>

                <p className="text-sm text-gray-500">
                  {m.location?.city}, {m.location?.state}
                </p>

                <p className="text-sm text-gray-400">
                  {m.location?.address}
                </p>

                {/* Optional: show coords */}
                {m.location?.coordinates && (
                  <p className="text-xs text-gray-400">
                    📍 {m.location.coordinates.lat}, {m.location.coordinates.lng}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">₹{m.price}</p>

                {m.stock > 0 ? (
                  <span className="text-green-500 text-sm">
                    In Stock ({m.stock})
                  </span>
                ) : (
                  <span className="text-red-500 text-sm">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          ))
        )}
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
                  {order.city}, {order.state}
                </p>

                <p className="text-sm text-gray-500">
                  Status: {order.status}
                </p>
              </div>

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
                  {order.status === "Accepted"
                    ? "✅ Accepted"
                    : "❌ Rejected"}
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
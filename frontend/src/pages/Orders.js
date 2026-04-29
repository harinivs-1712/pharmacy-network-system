
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Navigate } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);

   const token = localStorage.getItem("token");


  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? updatedOrder : o
        )
      );

      alert(`Order ${updatedOrder.name} is now ${updatedOrder.status}`);
    });

    return () => socket.disconnect();
  }, []);

  /* ---------------- FETCH ORDERS ---------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/orders", {
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 FIX
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, [token]);

 
  if (!token) return <Navigate to="/" />;

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders 📦</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
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

                {/* ✅ Show location instead of distance */}
                <p className="text-sm text-gray-500">
                  {order.city}, {order.state}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  order.status === "Pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : order.status === "Accepted"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {order.status === "Pending"
                  ? "⏳ Pending"
                  : order.status === "Accepted"
                  ? "✅ Accepted"
                  : "❌ Rejected"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;


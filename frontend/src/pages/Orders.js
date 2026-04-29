import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    // listen for updates
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id ? updatedOrder : o
        )
      );

      alert(`Order ${updatedOrder.name} is now ${updatedOrder.status}`);
    });

    // cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

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
                <p className="text-sm text-gray-500">
                  {order.distance} km away
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
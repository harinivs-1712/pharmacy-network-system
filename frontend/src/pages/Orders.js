import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function Orders() {
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updatedOrder._id
            ? updatedOrder
            : o
        )
      );

      toast.success(
        `Order updated to ${updatedOrder.status}`
      );
    });

    return () => socket.disconnect();
  }, []);

  /* ---------------- FETCH ORDERS ---------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed");
          return;
        }

        setOrders(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [token]);

  /* ---------------- AUTH ---------------- */
  if (!token) return <Navigate to="/" />;

  /* ---------------- STATUS COLORS ---------------- */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

          <div>
            <h1 className="text-4xl font-black text-gray-800">
              My Orders 📦
            </h1>

            <p className="text-gray-500 mt-2">
              Track your medicine deliveries
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md px-6 py-4 border border-gray-200">
            <p className="text-gray-500 text-sm">
              Total Orders
            </p>

            <h2 className="text-3xl font-black text-teal-600">
              {orders.length}
            </h2>
          </div>

        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (

          <div className="bg-white rounded-3xl p-16 text-center shadow">

            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              No Orders Yet 😔
            </h2>

            <p className="text-gray-500">
              Start adding medicines to cart
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {orders.map((order) => (

              <div
                key={order._id}
                className="bg-white rounded-3xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition"
              >

                <div className="grid md:grid-cols-[1fr_220px_160px] gap-6 items-center">

                  {/* LEFT */}
                  <div>

                    <div className="flex justify-between items-start mb-4">

                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {order.name || "Medicine Order"}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Order ID: {order._id}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusStyle(order.status)}`}
                      >
                        {order.status || "Pending"}
                      </span>

                    </div>

                    <div className="space-y-2 text-sm text-gray-600">

                      <p>
                        📍{" "}
                        <span className="font-medium">
                          {order.city || "Bangalore"},{" "}
                          {order.state || "Karnataka"}
                        </span>
                      </p>

                      <p>
                        💳 Payment:{" "}
                        <span className="font-medium">
                          {order.paymentMethod || "COD"}
                        </span>
                      </p>

                      <p>
                        🛒 Items:{" "}
                        <span className="font-medium">
                          {order.items?.length || 0}
                        </span>
                      </p>

                    </div>

                  </div>

                  {/* CENTER */}
                  <div className="bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100 rounded-3xl p-5 text-center">

                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                      Total Amount
                    </p>

                    <h2 className="text-4xl font-black text-teal-600">
                      ₹
                      {order.totalAmount ||
                        order.price ||
                        0}
                    </h2>

                    {order.discount > 0 && (
                      <p className="text-green-600 text-sm mt-2 font-semibold">
                        Saved ₹{order.discount}
                      </p>
                    )}

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col gap-3">

                    <button
                      onClick={() =>
                        alert(
                          `Tracking Order\n\nOrder ID: ${order._id}\nStatus: ${order.status}`
                        )
                      }
                      className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl py-3 font-semibold transition"
                    >
                      📍 Track Order
                    </button>

                    <button
                      onClick={() =>
                        alert(
                          `Support\n\nPhone: 1800-PHARMLY\nEmail: support@pharmly.com`
                        )
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-3 font-semibold transition"
                    >
                      💬 Help
                    </button>

                  </div>

                </div>

                {/* ITEMS */}
                {order.items && order.items.length > 0 && (

                  <div className="mt-6 border-t pt-5">

                    <h3 className="font-bold text-gray-700 mb-3">
                      Ordered Medicines
                    </h3>

                    <div className="flex flex-wrap gap-3">

                      {order.items.map((item, index) => (

                        <div
                          key={index}
                          className="bg-gray-100 rounded-xl px-4 py-2"
                        >
                          <p className="font-semibold text-gray-700">
                            {item.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Orders;


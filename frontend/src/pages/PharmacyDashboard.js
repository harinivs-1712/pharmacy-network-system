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

      const res = await fetch(
        "http://localhost:5000/medicines",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("MEDICINES:", data);

      // ✅ HANDLE ALL POSSIBLE RESPONSES
      if (Array.isArray(data)) {
        setMedicines(data);

      } else if (Array.isArray(data.medicines)) {
        setMedicines(data.medicines);

      } else {
        setMedicines([]);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load medicines");
    }
  };



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

      console.log("ORDERS:", data);

      // ✅ HANDLE ALL POSSIBLE RESPONSES
      if (Array.isArray(data)) {
        setOrders(data);

      } else if (Array.isArray(data.orders)) {
        setOrders(data.orders);

      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
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
  <div className="flex min-h-screen bg-[#F4F7FB]">

    {/* SIDEBAR */}
    <div className="w-60 bg-gradient-to-b from-[#0F766E] to-[#115E59] text-white fixed left-0 top-0 h-screen flex flex-col justify-between p-5 shadow-xl z-50">

      <div>

        <div className="mb-10">

          <h1 className="text-3xl font-bold">
            💊 Pharmly
          </h1>

          <p className="text-teal-100 mt-1 text-sm">
            Pharmacy Dashboard
          </p>

        </div>

        <div className="space-y-3">

          <button className="w-full text-left bg-yellow-400 text-black px-4 py-3 rounded-xl font-medium shadow">
            💊 My Medicines
          </button>

          <button className="w-full text-left hover:bg-white/10 px-4 py-3 rounded-xl transition">
            📦 Orders
          </button>

        </div>

      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 transition py-3 rounded-xl font-medium"
      >
        Logout
      </button>

    </div>

    {/* MAIN CONTENT */}
    <div className="ml-60 flex-1 p-8 overflow-x-hidden">

      {/* TOP SECTION */}
      <div className="mb-10">

        {/* WELCOME */}
        <div>

          <h1 className="text-4xl font-bold text-gray-800 leading-tight">
            Welcome, {user?.name} 👋
          </h1>

          <p className="text-gray-500 mt-4 text-base">
            Manage medicines and incoming orders
          </p>

          {/* STATS */}
          <div className="flex gap-5 mt-8 mb-8 flex-wrap">

            <div className="bg-white shadow rounded-2xl px-6 py-5 min-w-[180px]">

              <p className="text-gray-500 text-sm">
                Total Medicines
              </p>

              <h2 className="text-4xl font-bold text-teal-600 mt-2">
                {medicines.length}
              </h2>

            </div>

            <div className="bg-white shadow rounded-2xl px-6 py-5 min-w-[180px]">

              <p className="text-gray-500 text-sm">
                Total Orders
              </p>

              <h2 className="text-4xl font-bold text-blue-600 mt-2">
                {orders.length}
              </h2>

            </div>

          </div>

        </div>

        {/* ADD MEDICINE */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">

          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Add Medicine 💊
          </h2>

          <p className="text-gray-500 mb-5 text-sm">
            Add medicines to your inventory
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Medicine Name"
              className="bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm"
            />

            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm"
            />

            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock"
              className="bg-gray-100 rounded-xl px-4 py-3 outline-none text-sm"
            />

            <button
              onClick={addMedicine}
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl font-medium text-sm hover:scale-105 transition"
            >
              Add
            </button>

          </div>

        </div>

      

      {/* MEDICINES TABLE */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">

        <div className="px-6 py-5 border-b">

          <h2 className="text-2xl font-semibold text-gray-800">
            Your Medicines 💊
          </h2>

          <p className="text-gray-500 mt-1 text-sm">
            Manage your pharmacy inventory
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-[#0F766E] text-white">

              <tr>

                <th className="text-left px-6 py-4 text-sm font-medium">
                  Medicine Name
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium">
                  Price
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium">
                  Stock
                </th>

                <th className="text-left px-6 py-4 text-sm font-medium">
                  Location
                </th>

              </tr>

            </thead>

            <tbody>

              {medicines.map((m, index) => {

                const data = m._doc || m;

                return (

                  <tr
                    key={data._id}
                    className={`border-b ${
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }`}
                  >

                    <td className="px-6 py-4 font-medium text-gray-800 text-sm">
                      {data.name}
                    </td>

                    <td className="px-6 py-4 text-teal-600 font-semibold text-sm">
                      ₹{data.price}
                    </td>

                    <td className="px-6 py-4">

                      {data.stock > 0 ? (

                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                          {data.stock} In Stock
                        </span>

                      ) : (

                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </span>

                      )}

                    </td>

                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {data.location?.city || "N/A"}
                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* ORDERS */}
      <div className="mt-10">

        <h2 className="text-2xl font-semibold text-gray-800 mb-5">
          Incoming Orders 📦
        </h2>

        <div className="space-y-5">

          {orders.length === 0 ? (

            <div className="bg-white rounded-2xl p-8 shadow text-center text-gray-500">
              No incoming orders
            </div>

          ) : (

            orders.map((order) => (

              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">

                  <div>

                    <h3 className="font-semibold text-base text-gray-800">
                      Order ID
                    </h3>

                    <p className="text-gray-500 text-xs">
                      {order._id}
                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-xs font-medium ${
                      order.status === "Accepted"
                        ? "bg-green-100 text-green-600"
                        : order.status === "Rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>

                </div>

                {/* ITEMS */}
                <div className="p-6">

                  <div className="space-y-3">

                    {order.items?.map((item, index) => (

                      <div
                        key={index}
                        className="flex justify-between items-center border rounded-xl px-5 py-4"
                      >

                        <div>

                          <h4 className="font-medium text-gray-800 text-base">
                            {item.name}
                          </h4>

                          <p className="text-gray-500 text-sm mt-1">
                            Quantity: {item.quantity}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-teal-600 font-semibold text-base">
                            ₹{item.price}
                          </p>

                        </div>

                      </div>

                    ))}

                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-between items-center mt-6 flex-wrap gap-4">

                    <h2 className="text-xl font-bold text-gray-800">
                      ₹
                      {order.items?.reduce(
                        (sum, item) =>
                          sum + item.price * item.quantity,
                        0
                      )}
                    </h2>

                    {order.status !== "Accepted" &&
                      order.status !== "Rejected" && (

                        <div className="flex gap-3">

                          <button
                            onClick={() =>
                              updateStatus(order._id, "Accepted")
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(order._id, "Rejected")
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
                          >
                            Reject
                          </button>

                        </div>

                      )}

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>

  </div>
  </div>
);

}

export default PharmacyDashboard;
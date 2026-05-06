import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer
} from "recharts";

function AdminDashboard() {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [analytics, setAnalytics] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!token || currentUser?.role !== "admin") return;

    fetch(`http://localhost:5000/users?page=${page}&search=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setTotalPages(data.pages || 1);
      });

    fetch("http://localhost:5000/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAnalytics(data || {}));

  }, [token, refresh, page, search]);

  if (!token || currentUser?.role !== "admin") {
    return <Navigate to="/" />;
  }

  const trendData = [
    { day: "Jan 01", pharmacy: 40, patient: 30 },
    { day: "Jan 02", pharmacy: 20, patient: 50 },
    { day: "Jan 03", pharmacy: 60, patient: 45 },
    { day: "Jan 04", pharmacy: 30, patient: 70 },
    { day: "Jan 05", pharmacy: 90, patient: 60 },
    { day: "Jan 06", pharmacy: 50, patient: 40 },
    { day: "Jan 07", pharmacy: 20, patient: 30 },
  ];

  const chartData = [
    { name: "Accepted", value: analytics?.statusData?.accepted || 0 },
    { name: "Pending", value: analytics?.statusData?.pending || 0 },
    { name: "Rejected", value: analytics?.statusData?.rejected || 0 },
  ];

  return (
  <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-gray-200">

    {/* SIDEBAR */}
    <div className="w-72 bg-gradient-to-b from-[#0F766E] to-[#115E59] text-white fixed h-screen p-6 flex flex-col justify-between shadow-2xl">

      <div>

        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">
            💊 Pharmly
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Admin Dashboard
          </p>
        </div>

        <div className="space-y-3">

          <div className="bg-gradient-to-r from-teal-500 to-green-500 px-4 py-3 rounded-2xl font-semibold shadow-lg">
            📊 Dashboard
          </div>

          <div className="hover:bg-gray-800 transition px-4 py-3 rounded-2xl cursor-pointer">
            👥 Users
          </div>

          <div className="hover:bg-gray-800 transition px-4 py-3 rounded-2xl cursor-pointer">
            💊 Medicines
          </div>

          <div className="hover:bg-gray-800 transition px-4 py-3 rounded-2xl cursor-pointer">
            📦 Orders
          </div>

        </div>
      </div>

      <button
        className="w-full bg-red-500 hover:bg-red-600 py-3 rounded-2xl font-semibold transition"
      >
        Logout
      </button>

    </div>

    {/* MAIN */}
    <div className="ml-72 flex-1 p-8">

      {/* TOP HEADER */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100">

        <div className="flex flex-col lg:flex-row justify-between gap-6">

          <div>
            <h1 className="text-4xl font-black text-gray-800">
              Welcome Admin 👋
            </h1>

            <p className="mt-2 text-gray-500">
              Manage users, medicines and pharmacy analytics
            </p>
          </div>

          <div className="flex gap-3 h-fit">

            <input
              placeholder="Search users..."
              className="px-5 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-teal-400"
              
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />

            <button
              onClick={() =>
                setRefresh((prev) => !prev)
              }
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition shadow-lg"
            >
              Refresh
            </button>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        <Card
          title="Total Users"
          value={analytics?.totalUsers || 0}
          color="text-blue-500"
        />

        <Card
          title="Medicines"
          value={analytics?.totalMedicines || 0}
          color="text-green-500"
        />

        <Card
          title="Orders"
          value={analytics?.totalOrders || 0}
          color="text-purple-500"
        />

        <Card
          title="Pending"
          value={analytics?.statusData?.pending || 0}
          color="text-orange-500"
        />

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

        {/* AREA CHART */}
        <div className="xl:col-span-2 bg-white/70 backdrop-blur rounded-3xl p-6 shadow-xl border border-white/50">

          <div className="flex justify-between items-center mb-5">

            <h3 className="text-xl font-bold text-gray-700">
              📈 Network Activity
            </h3>

            <span className="text-sm text-gray-400">
              Last 7 days
            </span>

          </div>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trendData}>

              <defs>

                <linearGradient
                  id="greenWave"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#14B8A6"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="#14B8A6"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id="blueWave"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#3B82F6"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="#3B82F6"
                    stopOpacity={0}
                  />
                </linearGradient>

              </defs>

              <CartesianGrid stroke="#E5E7EB" />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Area
                type="monotone"
                dataKey="pharmacy"
                stroke="#14B8A6"
                fill="url(#greenWave)"
              />

              <Area
                type="monotone"
                dataKey="patient"
                stroke="#3B82F6"
                fill="url(#blueWave)"
              />

            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* PIE */}
        <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-xl border border-white/50">

          <h3 className="text-xl font-bold text-gray-700 mb-6">
            📦 Order Status
          </h3>

          <div className="flex justify-center">

            <PieChart width={280} height={280}>

              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={100}
                innerRadius={60}
              >
                <Cell fill="#14B8A6" />
                <Cell fill="#3B82F6" />
                <Cell fill="#CBD5E1" />
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </div>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-white/50 p-6">

        <div className="flex justify-between items-center mb-6">

          <h3 className="text-2xl font-bold text-gray-700">
            👥 Users
          </h3>

          <div className="text-sm text-gray-500">
            Total: {users.length}
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b text-gray-500 text-sm">

                <th className="text-left py-4">
                  Name
                </th>

                <th className="text-left">
                  Email
                </th>

                <th className="text-left">
                  Role
                </th>

                <th className="text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((u, i) => (

                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition"
                >

                  <td className="py-5 font-semibold text-gray-800">
                    {u.name}
                  </td>

                  <td className="text-gray-600">
                    {u.email}
                  </td>

                  <td>

                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                      {u.role}
                    </span>

                  </td>

                  <td>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === "pharmacy"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      Active
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-2 mt-8 flex-wrap">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage((p) => p - 1)
            }
            className="px-4 py-2 rounded-xl bg-white shadow border hover:bg-gray-100 disabled:opacity-40"
          >
            ← Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (

            <button
              key={i}
              onClick={() =>
                setPage(i + 1)
              }
              className={`px-4 py-2 rounded-xl font-medium ${
                page === i + 1
                  ? "bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg"
                  : "bg-white border hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>

          ))}

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => p + 1)
            }
            className="px-4 py-2 rounded-xl bg-white shadow border hover:bg-gray-100 disabled:opacity-40"
          >
            Next →
          </button>

        </div>

      </div>

    </div>

  </div>
);
}

function Card({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-xl font-bold ${color}`}>{value}</h3>
      <p className="text-xs text-green-500 mt-1">+5% from last week</p>
    </div>
  );
}

export default AdminDashboard;
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

  useEffect(() => {
    if (!token || currentUser?.role !== "admin") return;

    fetch("http://localhost:5000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []));

    fetch("http://localhost:5000/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAnalytics(data || {}));
  }, [token]);

  if (!token || currentUser?.role !== "admin") {
    return <Navigate to="/" />;
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ UPDATED GRAPH DATA
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
    <div className="flex min-h-screen bg-[#F5F7FA]">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#2A3F54] text-white p-6">
        <h1 className="text-xl font-bold mb-8">Admin Panel</h1>

        <div className="space-y-3 text-sm">
          <div className="p-2 rounded bg-[#1ABB9C]">Dashboard</div>
          <div className="p-2 hover:bg-[#3E5367] rounded cursor-pointer">Users</div>
          <div className="p-2 hover:bg-[#3E5367] rounded cursor-pointer">Medicines</div>
          <div className="p-2 hover:bg-[#3E5367] rounded cursor-pointer">Orders</div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>

          <input
            placeholder="Search users..."
            className="px-4 py-2 rounded border bg-white"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card title="Total Users" value={analytics?.totalUsers || 0} color="text-blue-500" />
          <Card title="Medicines" value={analytics?.totalMedicines || 0} color="text-green-500" />
          <Card title="Orders" value={analytics?.totalOrders || 0} color="text-purple-500" />
          <Card title="Pending" value={analytics?.statusData?.pending || 0} color="text-orange-500" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-3 gap-6 mb-8">

          {/* AREA CHART */}
          <div className="col-span-2 bg-white p-6 rounded shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-700">Network Activity</h3>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>

                <defs>
                  <linearGradient id="greenWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#26B99A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#26B99A" stopOpacity={0}/>
                  </linearGradient>

                  <linearGradient id="blueWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498DB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3498DB" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
                  formatter={(value, name) => [
                    value,
                    name === "pharmacy" ? "Pharmacy" : "Patient"
                  ]}
                />

                <Legend
                  formatter={(value) =>
                    value === "pharmacy" ? "Pharmacy" : "Patient"
                  }
                />

                {/* PHARMACY */}
                <Area
                  type="monotone"
                  dataKey="pharmacy"
                  stroke="#26B99A"
                  fill="url(#greenWave)"
                  strokeWidth={2}
                />

                {/* PATIENT */}
                <Area
                  type="monotone"
                  dataKey="patient"
                  stroke="#3498DB"
                  fill="url(#blueWave)"
                  strokeWidth={2}
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded shadow-sm">
            <h3 className="mb-4 font-semibold">Order Status</h3>

            <PieChart width={260} height={260}>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={4}
              >
                <Cell fill="#26B99A" /> {/* Accepted */}
                <Cell fill="#3498DB" /> {/* Pending */}
                <Cell fill="#BDC3C7" /> {/* Rejected */}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

        </div>

        {/* USERS TABLE */}
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="mb-4 font-semibold">Users</h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td>{u.email}</td>

                  <td>
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                      {u.role}
                    </span>
                  </td>

                  <td>
                    <span className={`px-3 py-1 text-xs rounded ${
                      u.role === "pharmacy"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded shadow-sm border">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-xl font-bold ${color}`}>{value}</h3>
      <p className="text-xs text-green-500 mt-1">+5% from last week</p>
    </div>
  );
}

export default AdminDashboard;
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";


function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [analytics, setAnalytics] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [pagedUsers, setPagedUsers] = useState([]);
  const [pages, setPages] = useState(1);

  // ✅ useEffect ALWAYS runs (hook rule satisfied)
  useEffect(() => {
    if (!token || currentUser?.role !== "admin") return;

    fetch("http://localhost:5000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, currentUser]);

  useEffect(() => {
    if (!token || currentUser?.role !== "admin") return;

    fetch(
      `http://localhost:5000/users?page=${page}&search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load users");
        return res.json();
      })
      .then((result) => {
        setPagedUsers(result.users || []);
        setPages(result.pages || 1);
      })
      .catch((err) => {
        console.error("Paged users error:", err);
        setPagedUsers([]);
        setPages(1);
      });
  }, [token, currentUser, page, search, role]);

  useEffect(() => {
    if (!token || currentUser?.role !== "admin") return;

    fetch("http://localhost:5000/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Analytics error:", err));
  }, [token, currentUser]);

  // ✅ Now safe to return conditionally
  if (!token || currentUser?.role !== "admin") {
    return <Navigate to="/" />;
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  const chartData = analytics?.statusData
    ? [
        { name: "Pending", value: analytics.statusData.pending },
        { name: "Accepted", value: analytics.statusData.accepted },
        { name: "Rejected", value: analytics.statusData.rejected },
      ]
    : [];

  return (
  <div className="p-6">

    {/* Title */}
    <h1 className="text-2xl font-bold mb-6">
      Admin Dashboard 👑
    </h1>

    {/* 🔍 Search + Filter */}
    <div className="mb-6 flex flex-wrap gap-3 items-center">

      {/* Search with icon */}
      <div className="relative w-64">
        <input
          placeholder="Search user..."
          className="border p-2 pl-10 rounded w-full"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      {/* Role filter */}
      <select
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
          setPage(1);
        }}
        className="border p-2 rounded"
      >
        <option value="">All Roles</option>
        <option value="patient">Patient</option>
        <option value="pharmacy">Pharmacy</option>
      </select>

    </div>

    {/* 👥 Users List */}
    <div className="space-y-3 mb-6">

      {pagedUsers.length > 0 ? (
        pagedUsers.map((u, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow flex justify-between">

            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
            </div>

            <span className={`px-3 py-1 text-xs rounded ${
              u.role === "pharmacy"
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
            }`}>
              {u.role}
            </span>

          </div>
        ))
      ) : (
        <div className="bg-white p-4 rounded shadow text-gray-500">
          No users found.
        </div>
      )}

    </div>

    {/* 📄 Pagination */}
    <div className="flex items-center gap-3 mb-8">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-sm">Page {page} of {pages}</span>

      <button
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>

    </div>

    {/* 📊 Analytics Section */}
    <h2 className="text-xl font-bold mb-4">
      Analytics 📊
    </h2>

    {analytics && (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Users</p>
            <p className="text-xl font-bold">{analytics.totalUsers}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Medicines</p>
            <p className="text-xl font-bold">{analytics.totalMedicines}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Orders</p>
            <p className="text-xl font-bold">{analytics.totalOrders}</p>
          </div>

        </div>

        {/* Pie Chart */}
        <PieChart width={400} height={300}>
          <Pie
            data={chartData}
            dataKey="value"
            outerRadius={100}
            label
          >
            <Cell fill="#facc15" />   {/* Pending */}
            <Cell fill="#22c55e" />   {/* Accepted */}
            <Cell fill="#ef4444" />   {/* Rejected */}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </>
    )}

  </div>
);
}

export default AdminDashboard;
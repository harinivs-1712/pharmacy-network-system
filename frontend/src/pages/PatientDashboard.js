
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function PatientDashboard({ orders = [], setOrders }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [sortType, setSortType] = useState("price");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [medicines, setMedicines] = useState([]);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  /* ---------------- FETCH MEDICINES ---------------- */
  useEffect(() => {
    if (!token) return;

    if (!user?.city) {
      console.log("City missing ❌");
      return;
    }

    const fetchMeds = async () => {
      try {
        const city = user.city.trim().toLowerCase();

        const res = await fetch(
          `http://localhost:5000/medicines?city=${city}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.log("ERROR:", text);
          throw new Error("Fetch failed");
        }

        const data = await res.json();
        setMedicines(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load medicines ❌");
        setMedicines([]);
      }
    };

    fetchMeds();
  }, [user?.city, token]);

  if (!token) return <Navigate to="/" />;

  /* ---------------- FILTER ---------------- */
  let filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  if (inStockOnly) filtered = filtered.filter((m) => m.stock > 0);

  /* ---------------- GROUP ---------------- */
  const grouped = {};
  filtered.forEach((m) => {
    if (!grouped[m.name]) grouped[m.name] = [];
    grouped[m.name].push(m);
  });

  /* ---------------- SORT ---------------- */
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => a.price - b.price);
  });

  /* ---------------- ORDER ---------------- */
  const handleConfirm = async () => {
    if (!selected) {
      toast.error("No medicine selected");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/add-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selected.name,
          price: selected.price,
          pharmacyId: selected.pharmacyId,
        }),
      });

      if (!res.ok) throw new Error();

      if (setOrders) setOrders([...orders, selected]);

      toast.success("Order placed ✅");
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("Order failed ❌");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out 👋");
    window.location.href = "/";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* TOP BAR */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => navigate("/orders")}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg"
        >
          View Orders
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Search Medicines 💊</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search medicine..."
        className="w-full p-3 mb-6 rounded-xl border"
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex gap-4 mb-4">
        <select
          className="p-2 border rounded"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="price">Sort by Price</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
          />
          In Stock Only
        </label>
      </div>

      {/* RESULTS */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500">No medicines found</p>
        ) : (
          Object.keys(grouped).map((medName) => {
            const medList = grouped[medName];
            const bestPrice = Math.min(...medList.map((m) => m.price));

            return (
              <div key={medName}>
                <h2 className="text-xl font-bold mb-2">{medName}</h2>

                {medList.map((m, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl shadow mb-2 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold">{m.pharmacyName}</p>

                      {/* ✅ SHOW FULL LOCATION */}
                      <p className="text-sm text-gray-500">
                        {m.location?.city}, {m.location?.state}
                      </p>

                      <p className="text-sm">Stock: {m.stock}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">₹{m.price}</p>

                      {m.price === bestPrice && (
                        <span className="text-xs text-green-600">
                          Best Price
                        </span>
                      )}

                      <button
                        onClick={() => setSelected(m)}
                        className="block mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* POPUP */}
      {selected && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-white p-4 shadow-lg rounded-xl w-80">
          <h3 className="font-bold mb-2">Confirm Order</h3>
          <p>{selected.name}</p>
          <p>₹{selected.price}</p>

          <button
            onClick={handleConfirm}
            className="mt-3 w-full bg-green-500 text-white p-2 rounded-lg"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;


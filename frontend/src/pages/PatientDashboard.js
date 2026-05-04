


import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function PatientDashboard() {
  const [query, setQuery] = useState("");
  const [sortType, setSortType] = useState("distance");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [quantities, setQuantities] = useState({});

  const [file, setFile] = useState(null);
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetch("http://localhost:5000/medicines", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setMedicines)
      .catch(() => toast.error("Failed to load medicines"));
  }, [token]);

  if (!token) return <Navigate to="/" />;

  /* ---------------- UPLOAD PRESCRIPTION ---------------- */
  const uploadPrescription = async () => {
    if (!file) return toast.error("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingUpload(true);

      const res = await fetch("http://localhost:5000/upload-prescription", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Upload failed");
        return;
      }

      setPrescriptionMeds(data.medicines || []);
      toast.success("Prescription processed ✅");

    } catch {
      toast.error("Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  let filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  if (inStockOnly) {
    filtered = filtered.filter((m) => m.stock > 0);
  }

  /* ---------------- GROUP ---------------- */
  const grouped = {};
  filtered.forEach((m) => {
    if (!grouped[m.name]) grouped[m.name] = [];
    grouped[m.name].push(m);
  });

  /* ---------------- SORT ---------------- */
  Object.keys(grouped).forEach((key) => {
    if (sortType === "price") {
      grouped[key].sort((a, b) => a.price - b.price);
    } else {
      grouped[key].sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    }
  });

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = async (m) => {
    const quantity = quantities[m._id] || 1;

    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: m._id,
          name: m.name,
          price: m.price,
          pharmacyId: m.pharmacyId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }

      toast.success("Added to cart 🛒");

    } catch {
      toast.error("Error adding to cart");
    }
  };

  const addPrescriptionToCart = async (med) => {
    if (!med.best) return toast.error("Not available");

    const m = med.best;
    const quantity = quantities[m._id] || 1;

    addToCart({ ...m, quantity });
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Pharmacy 💊</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/cart")}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow"
          >
            🛒 Cart
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search medicine..."
        className="w-full p-3 mb-4 rounded-xl border shadow"
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* PRESCRIPTION */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Upload Prescription 📄</h2>

        <div className="flex gap-3">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />

          <button
            onClick={uploadPrescription}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {loadingUpload ? "Processing..." : "Upload"}
          </button>
        </div>
      </div>

      {/* PRESCRIPTION RESULTS */}
      {prescriptionMeds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-green-700 mb-3">
            Prescription Results 🧾
          </h2>

          {prescriptionMeds.map((med) => {
            const m = med.best;

            return (
              <div key={med.name} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between">

                <div>
                  <p className="font-semibold">{med.name}</p>
                  <p className="text-green-600">₹{m?.price}</p>
                </div>

                <button
                  onClick={() => addPrescriptionToCart(med)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="distance">Sort by Distance</option>
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

      {/* MEDICINES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(grouped).map((medName) => {
          const medList = grouped[medName];
          const bestPrice = Math.min(...medList.map((m) => m.price));

          return medList.map((m) => (
            <div
              key={m._id}
              onClick={() => navigate(`/medicine/${m._id}`)}
              className="bg-white p-4 rounded-2xl shadow hover:shadow-xl transition cursor-pointer"
            >

              {/* IMAGE */}
              <img
    src={m.image || "https://via.placeholder.com/150"}
    alt={m.name}
    className="max-h-full max-w-full object-contain"
  />

              <h2 className="font-semibold">{m.name}</h2>

              <p className="text-sm text-gray-500">{m.pharmacyName}</p>

              <p className="text-blue-600 font-bold">₹{m.price}</p>

              {m.price === bestPrice && (
                <span className="text-xs text-green-600">Best Price</span>
              )}

              {/* QUANTITY */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantities((prev) => ({
                      ...prev,
                      [m._id]: Math.max((prev[m._id] || 1) - 1, 1),
                    }));
                  }}
                  className="px-2 bg-gray-200 rounded"
                >-</button>

                <span>{quantities[m._id] || 1}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantities((prev) => ({
                      ...prev,
                      [m._id]: (prev[m._id] || 1) + 1,
                    }));
                  }}
                  className="px-2 bg-gray-200 rounded"
                >+</button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(m);
                }}
                className="w-full mt-3 bg-blue-500 text-white p-2 rounded-lg"
              >
                Add to Cart
              </button>

            </div>
          ));
        })}
      </div>

    </div>
  );
}

export default PatientDashboard;
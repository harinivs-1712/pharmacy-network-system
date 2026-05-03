import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function PatientDashboard() {
  const [query, setQuery] = useState("");
  const [sortType, setSortType] = useState("distance");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [quantities, setQuantities] = useState({});

  // 🔥 NEW STATES
  const [file, setFile] = useState(null);
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const res = await fetch("http://localhost:5000/medicines", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setMedicines(data);

      } catch {
        toast.error("Failed to load medicines");
      }
    };

    if (token) fetchMeds();
  }, [token]);

  if (!token) return <Navigate to="/" />;

  /* ---------------- UPLOAD PRESCRIPTION ---------------- */
  const uploadPrescription = async () => {
    if (!file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingUpload(true);

      const res = await fetch("http://localhost:5000/upload-prescription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      grouped[key].sort((a, b) => a.distance - b.distance);
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

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-4">

        <button
          onClick={() => navigate("/orders")}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg"
        >
          View Orders
        </button>

        <div className="flex gap-2">

          <button
            onClick={() => navigate("/cart")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            🛒 Cart
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        Search Medicines 💊
      </h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search medicine..."
        className="w-full p-3 mb-4 rounded-xl border"
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* 🔥 UPLOAD PRESCRIPTION */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Upload Prescription 📄</h2>

        <div className="flex gap-2 items-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded"
          />

          <button
            onClick={uploadPrescription}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {loadingUpload ? "Processing..." : "Upload"}
          </button>
        </div>
      </div>

      {/* 🔥 PRESCRIPTION RESULTS */}
      {prescriptionMeds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-green-700">
            Detected from Prescription 🧾
          </h2>

          {prescriptionMeds.map((med) => {
  const m = med.best;

  return (
    <div key={med.name} className="mb-4">
      <h3 className="font-semibold">{med.name}</h3>

      {m ? (
        <div className="bg-green-50 p-3 rounded mt-2 flex justify-between items-center">

          {/* LEFT */}
          <div>
            <p className="font-medium text-green-700">Best Option</p>
            <p>{m.pharmacy?.name || m.pharmacyName}</p>
            <p>₹{m.price}</p>
          </div>

          {/* RIGHT (🔥 NEW ADDITION ONLY) */}
          <div className="text-right">

            {/* QUANTITY */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() =>
                  setQuantities((prev) => ({
                    ...prev,
                    [m._id]: Math.max((prev[m._id] || 1) - 1, 1),
                  }))
                }
                className="px-2 bg-gray-200 rounded"
              >
                -
              </button>

              <span>{quantities[m._id] || 1}</span>

              <button
                onClick={() =>
                  setQuantities((prev) => ({
                    ...prev,
                    [m._id]: (prev[m._id] || 1) + 1,
                  }))
                }
                className="px-2 bg-gray-200 rounded"
              >
                +
              </button>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={() => addPrescriptionToCart(med)}
              className="block mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add to Cart
            </button>

          </div>
        </div>
      ) : (
        <p className="text-red-500">Not available</p>
      )}
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

      {/* RESULTS */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p>No medicines found</p>
        ) : (
          Object.keys(grouped).map((medName) => {
            const medList = grouped[medName];
            const bestPrice = Math.min(...medList.map((m) => m.price));

            return (
              <div key={medName}>
                <h2 className="text-xl font-bold mb-2">{medName}</h2>

                {medList.map((m) => (
                  <div
                    key={m._id}
                    className="bg-white p-4 rounded-xl shadow flex justify-between items-center mb-3 hover:shadow-lg transition"
                  >

                    {/* LEFT */}
                    <div>
                      <p className="font-semibold">{m.pharmacyName}</p>

                      <p className="text-sm text-gray-500">
                        {m.location?.city}, {m.location?.state}
                      </p>

                      <p className="text-xs text-gray-400">
                        {m.location?.address}
                      </p>

                      <p className="text-sm text-blue-500">
                        📍 {m.distance?.toFixed(2)} km away
                      </p>

                      <p className="text-sm">
                        {m.stock > 0 ? "In Stock" : "Out of Stock"}
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{m.price}</p>

                      {m.price === bestPrice && (
                        <span className="text-xs text-green-600">
                          Best Price
                        </span>
                      )}

                      <div className="flex items-center gap-2 mt-2 justify-end">
                        <button
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [m._id]: Math.max((prev[m._id] || 1) - 1, 1),
                            }))
                          }
                          className="px-2 bg-gray-200 rounded"
                        >
                          -
                        </button>

                        <span>{quantities[m._id] || 1}</span>

                        <button
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [m._id]: (prev[m._id] || 1) + 1,
                            }))
                          }
                          className="px-2 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => addToCart(m)}
                        className="block mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Add to Cart
                      </button>

                    </div>

                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default PatientDashboard;
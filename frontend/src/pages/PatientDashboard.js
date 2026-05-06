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
  const user = JSON.parse(localStorage.getItem("user"));

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetch("http://localhost:5000/medicines", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();

        console.log("API RESPONSE:", data);

        // 🔥 HANDLE TOKEN EXPIRED
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.clear();
          window.location.href = "/";
          return;
        }

        // ✅ Normal case
        setMedicines(data);
      })
      .catch(() => {
        toast.error("Failed to load medicines");
        setMedicines([]);
      });
  }, [token]);

  if (!token) return <Navigate to="/" />;

  /* ---------------- UPLOAD PRESCRIPTION ---------------- */
  const uploadPrescription = async () => {
    if (!file) return toast.error("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingUpload(true);

      const res = await fetch(
        "http://localhost:5000/upload-prescription",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      console.log("UPLOAD RESPONSE:", data);

      if (!res.ok) {
        toast.error(data.message || "Upload failed");
        return;
      }

      setPrescriptionMeds(data.medicines || []);

      toast.success("Prescription processed ✅");

    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  const addToCart = async (item) => {
  try {

    console.log("ADDING ITEM:", item);

    const res = await fetch(
      "http://localhost:5000/cart/add",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          medicineId:
            item.medicineId || item._id,

          name: item.name,

          price: item.price,

          pharmacyId: item.pharmacyId,

          quantity: item.quantity || 1,
        }),
      }
    );

    const data = await res.json();

    console.log("ADD TO CART RESPONSE:", data);

    if (!res.ok) {
      toast.error(
        data.message || "Failed to add to cart"
      );
      return;
    }

    toast.success("Added to cart ✅");

  } catch (err) {

    console.error(err);

    toast.error("Cart error");
  }
};

/* ---------------- PRESCRIPTION ADD ---------------- */

const addPrescriptionToCart = async (med) => {

  if (!med.best) {
    return toast.error("Not available");
  }

  const m = med.best;

  console.log(
    "ADDING FROM PRESCRIPTION:",
    m
  );

  if (!m.pharmacyId) {
    return toast.error(
      "Pharmacy not found for this medicine"
    );
  }

  addToCart({
    medicineId: m._id,

    name: m.name,

    price: m.price,

    pharmacyId: m.pharmacyId,

    quantity: 1,
  });
};
  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const getImage = (img) => {
    if (!img) return "http://localhost:5000/images/default.png";

    if (img.startsWith("http")) return img;

    return `http://localhost:5000${img}`;
  };

  const grouped = medicines.reduce((acc, med) => {
    const key = med.name;

    if (!acc[key]) acc[key] = [];

    acc[key].push(med);

    acc[key].sort((a, b) => a.price - b.price);

    return acc;
  }, {});
  /* ---------------- UI ---------------- */
  return (
  <div className="flex min-h-screen bg-gray-100">

    {/* SIDEBAR */}
    <div className="w-64 bg-teal-800 text-white fixed left-0 top-0 h-screen flex flex-col justify-between p-5">
      <div>
        <h1 className="text-2xl font-bold mb-8">💊 Pharmly</h1>

        <div className="space-y-3">
          <button className="w-full text-left bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold">
            📄 My Medicines
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="w-full text-left px-4 py-2 hover:bg-teal-700 rounded-lg"
          >
            📦 My Orders
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="w-full text-left px-4 py-2 hover:bg-teal-700 rounded-lg"
          >
            🛒 Shopping Cart
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 w-full py-2 rounded-lg mt-auto"
      >
        Logout
      </button>
    </div>

    {/* MAIN */}
    <div className="ml-64 flex-1 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name || "Patient"} 👋
        </h1>
        <p className="text-gray-500">
          Find & order medicines at best prices
        </p>
      </div>

      {/* UPLOAD */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 border border-teal-200">
        <h2 className="font-semibold text-gray-700 mb-4">
          📄 Upload Prescription
        </h2>

        <div className="flex items-center gap-4">
          <label className="flex-1 border-2 border-dashed border-teal-300 rounded-lg p-4 text-center cursor-pointer hover:bg-teal-50">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <p className="text-gray-500">
              {file ? file.name : "Click to upload prescription"}
            </p>
          </label>

          <button
            onClick={uploadPrescription}
            className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 py-3 rounded-lg"
          >
            {loadingUpload ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* ================= PRESCRIPTION SLIDER ONLY ================= */}
      {prescriptionMeds.length > 0 && (
        <div className="mb-8 w-full">

          <h2 className="text-xl font-bold text-green-700 mb-4">
            Prescription Results 🧾
          </h2>

          <div className="relative w-full">

            {/* LEFT BUTTON */}
            <button
              onClick={() =>
                document.getElementById("scroll")?.scrollBy({
                  left: -300,
                  behavior: "smooth",
                })
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10"
            >
              ◀
            </button>

            {/* RIGHT BUTTON */}
            <button
              onClick={() =>
                document.getElementById("scroll")?.scrollBy({
                  left: 300,
                  behavior: "smooth",
                })
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10"
            >
              ▶
            </button>

            {/* SCROLL AREA */}
            <div
  id="scroll"
  className="flex gap-4 overflow-x-auto px-10 py-2 scrollbar-hide"
  style={{
    scrollBehavior: "smooth",
    minHeight: "260px"
  }}
>
              {prescriptionMeds.map((med) => {
                const m = med.best;
                if (!m || !m._id) return null;

                return (
                  <div
                    key={m._id}
                    className="min-w-[240px] bg-white rounded-2xl shadow p-4 flex flex-col justify-between"
                  >

                    {/* IMAGE */}
                    <div className="h-32 bg-gray-100 flex items-center justify-center mb-2">
                      <img
                        src={getImage(m.image)}
                        onError={(e) =>
                          (e.currentTarget.src =
                            "http://localhost:5000/images/default.png")
                        }
                        className="h-20 object-contain"
                      />
                    </div>

                    {/* NAME */}
                    <h3
                      onClick={() => navigate(`/medicine/${m._id}`)}
                      className="font-bold text-lg text-blue-600 cursor-pointer hover:underline"
                    >
                      {m.name}
                    </h3>

                    {/* PHARMACY */}
                    <p className="text-gray-400 text-sm mt-1">
                      {m.pharmacyName || "No Pharmacy Found"}
                    </p>

                    {/* PRICE */}
                    <p className="text-teal-600 font-bold mt-2">
                      ₹{m.price}
                    </p>

                    {/* BUTTON */}
                    <button
                      disabled={!m.pharmacyId}
                      onClick={() => addPrescriptionToCart(med)}
                      className={`mt-4 py-2 rounded-lg text-white ${
                        m.pharmacyId
                          ? "bg-teal-500 hover:bg-teal-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {m.pharmacyId ? "Add to Cart" : "Unavailable"}
                    </button>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Search medicines..."
        className="w-full mb-6 p-3 rounded-lg border"
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(grouped).map((name) => {
          const list = grouped[name];
          const best = list[0];

          return (
            <div key={name} className="bg-white rounded-2xl shadow">

              <div
                onClick={() => navigate(`/medicine/${best._id}`)}
                className="h-40 bg-gray-100 flex items-center justify-center"
              >
                <img
                  src={getImage(best.image)}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "http://localhost:5000/images/default.png")
                  }
                  className="h-24 object-contain"
                />
              </div>

              <div className="p-4">
                <h2 className="font-bold">{best.name}</h2>
                <p className="text-gray-400 text-sm">
                  {best.pharmacyName}
                </p>

                <div className="flex justify-between mt-2">
                  <p className="text-teal-600 font-bold">₹{best.price}</p>
                  <span className="text-xs bg-yellow-100 px-2 rounded">
                    ⭐ Best
                  </span>
                </div>

                <button
                  onClick={() => addToCart(best)}
                  className="w-full mt-3 bg-teal-500 text-white py-2 rounded"
                >
                  Add to Cart
                </button>

                {list.length > 1 && (
                  <details className="mt-3">
                    <summary className="text-blue-600 cursor-pointer">
                      View Alternatives
                    </summary>

                    <div className="mt-2 space-y-1">
                      {list.slice(1).map((alt) => (
                        <div
                          key={alt._id}
                          onClick={() =>
                            navigate(`/medicine/${alt._id}`)
                          }
                          className="flex justify-between bg-gray-100 px-2 py-1 rounded cursor-pointer"
                        >
                          <span>{alt.pharmacyName}</span>
                          <span className="text-green-600">
                            ₹{alt.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  </div>
);

    }
      export default PatientDashboard;
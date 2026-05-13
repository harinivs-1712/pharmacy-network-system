import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

function PatientDashboard() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [file, setFile] = useState(null);
  const [prescriptionMeds, setPrescriptionMeds] = useState([]);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5000/medicines", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.clear();
          window.location.href = "/";
          return;
        }
        setMedicines(data);
      })
      .catch(() => {
        toast.error("Failed to load medicines");
        setMedicines([]);
      });
  }, [token]);

  if (!token) return <Navigate to="/" />;

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

  const addToCart = async (item) => {
    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: item.medicineId || item._id,
          name: item.name,
          price: item.price,
          pharmacyId: item.pharmacyId,
          quantity: item.quantity || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to add to cart");
        return;
      }
      toast.success("Added to cart ✅");
    } catch {
      toast.error("Cart error");
    }
  };

  const addPrescriptionToCart = async (med) => {
    if (!med.best) return toast.error("Not available");
    const m = med.best;
    if (!m.pharmacyId) return toast.error("Pharmacy not found for this medicine");

    addToCart({
      medicineId: m._id,
      name: m.name,
      price: m.price,
      pharmacyId: m.pharmacyId,
      quantity: 1,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const medicineImages = [
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300",
  "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300",
  "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300",
  "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300",
  "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300"
];

const getImage = (img, medicineName = "") => {
  if (img && img.startsWith("http") && !img.includes("via.placeholder")) {
    return img;
  }
  if (img && !img.startsWith("http")) {
    return `http://localhost:5000${img}`;
  }
  const index = medicineName.length % medicineImages.length;
  return medicineImages[index];
};

  const grouped = medicines
    .filter((med) => med.name.toLowerCase().includes(query.toLowerCase()))
    .reduce((acc, med) => {
      const key = med.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(med);
      acc[key].sort((a, b) => a.price - b.price);
      return acc;
    }, {});

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-teal-800 text-white fixed left-0 top-0 h-screen flex flex-col justify-between p-5">
        <div>
          <h1 className="text-2xl font-bold mb-8">💊 Pharmly</h1>
          <div className="space-y-3">
            <button className="w-full text-left bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold">📄 My Medicines</button>
            <button onClick={() => navigate("/orders")} className="w-full text-left px-4 py-2 hover:bg-teal-700 rounded-lg">📦 My Orders</button>
            <button onClick={() => navigate("/cart")} className="w-full text-left px-4 py-2 hover:bg-teal-700 rounded-lg">🛒 Shopping Cart</button>
          </div>
        </div>
        <button onClick={handleLogout} className="bg-red-500 w-full py-2 rounded-lg mt-auto">Logout</button>
      </div>

      <div className="ml-64 flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || "Patient"} 👋</h1>
          <p className="text-gray-500">Find & order medicines at best prices</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow mb-6 border border-teal-200">
          <h2 className="font-semibold text-gray-700 mb-4">📄 Upload Prescription</h2>
          <div className="flex items-center gap-4">
            <label className="flex-1 border-2 border-dashed border-teal-300 rounded-lg p-4 text-center cursor-pointer hover:bg-teal-50">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              <p className="text-gray-500">{file ? file.name : "Click to upload prescription"}</p>
            </label>
            <button onClick={uploadPrescription} className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 py-3 rounded-lg">
              {loadingUpload ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {prescriptionMeds.length > 0 && (
          <div className="mb-8 w-full">
            <h2 className="text-xl font-bold text-green-700 mb-4">Prescription Results 🧾</h2>
            <div id="scroll" className="flex gap-4 overflow-x-auto px-10 py-2">
              {prescriptionMeds.map((med) => {
                const m = med.best;
                if (!m || !m._id) return null;
                return (
                  <div key={m._id} className="min-w-[240px] bg-white rounded-2xl shadow p-4">
                    <div className="h-32 bg-gray-100 flex items-center justify-center mb-2">
                      <img src={getImage(m.image, m.name)} className="h-20 object-contain" alt={m.name} />
                    </div>
                    <h3 onClick={() => navigate(`/medicine/${m._id}`)} className="font-bold text-lg text-blue-600 cursor-pointer hover:underline">{m.name}</h3>
                    <p className="text-gray-400 text-sm">{m.pharmacyName || "No Pharmacy Found"}</p>
                    <p className="text-teal-600 font-bold mt-2">₹{m.price}</p>
                    <button onClick={() => addPrescriptionToCart(med)} className="mt-4 py-2 rounded-lg text-white bg-teal-500 w-full">Add to Cart</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <input type="text" placeholder="Search medicines..." className="w-full mb-6 p-3 rounded-lg border" onChange={(e) => setQuery(e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(grouped).map((name) => {
            const best = grouped[name][0];
            return (
              <div key={name} className="bg-white rounded-2xl shadow">
                <div onClick={() => navigate(`/medicine/${best._id}`)} className="h-40 bg-gray-100 flex items-center justify-center">
                  <img src={getImage(best.image, best.name)} className="h-24 object-contain" alt={best.name} />
                </div>
                <div className="p-4">
                  <h2 className="font-bold">{best.name}</h2>
                  <p className="text-gray-400 text-sm">{best.pharmacyName}</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-teal-600 font-bold">₹{best.price}</p>
                    <span className="text-xs bg-yellow-100 px-2 rounded">⭐ Best</span>
                  </div>
                  <button onClick={() => addToCart(best)} className="w-full mt-3 bg-teal-500 text-white py-2 rounded">Add to Cart</button>
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

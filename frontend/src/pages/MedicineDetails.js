import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [med, setMed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const token = localStorage.getItem("token");

  /* ---------------- FETCH MEDICINE ---------------- */
  useEffect(() => {
    if (!token) return; // ✅ prevent unnecessary fetch

    const fetchMed = async () => {
      try {
        const res = await fetch(`http://localhost:5000/medicine/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load");
          setMed(null);
          return;
        }

        setMed(data);

      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching medicine");
        setMed(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMed();
  }, [id, token]);

  /* ---------------- PROTECT ROUTE (AFTER HOOKS) ---------------- */
  if (!token) return <Navigate to="/" />;

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading medicine details...
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (!med) {
    return (
      <div className="p-6 text-center text-red-500">
        Medicine not found
      </div>
    );
  }

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: med._id,
          name: med.name,
          price: med.price,
          pharmacyId: med.pharmacyId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed");
        return;
      }

      toast.success("Added to cart 🛒");

    } catch (err) {
      console.error(err);
      toast.error("Error adding to cart");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6 flex justify-center items-center">

      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xl w-full">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back
        </button>

        {/* IMAGE */}
        <div className="w-full h-60 flex items-center justify-center bg-gray-100 rounded-lg mb-4 overflow-hidden">
          <img
            src={med?.image || "https://via.placeholder.com/200"}
            alt={med?.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* NAME */}
        <h1 className="text-2xl font-bold mb-1">{med?.name}</h1>

        {/* PHARMACY */}
        <p className="text-gray-500 mb-2">
          {med?.pharmacyName}
        </p>

        {/* PRICE */}
        <p className="text-blue-600 text-xl font-semibold mb-3">
          ₹{med?.price}
        </p>

        {/* DESCRIPTION */}
        <p className="text-gray-700 mb-4 leading-relaxed">
          {med?.description || "No description available"}
        </p>

        {/* STOCK */}
        <p className={`text-sm mb-3 ${med?.stock > 0 ? "text-green-600" : "text-red-500"}`}>
          {med?.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>

        {/* QUANTITY */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>

          <span className="font-semibold">{quantity}</span>

          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>

        {/* ADD TO CART */}
        <button
          onClick={addToCart}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add to Cart
        </button>

      </div>

    </div>
  );
}

export default MedicineDetails;
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
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 p-6 flex items-center justify-center">

    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">

      {/* LEFT SIDE - IMAGE */}
      <div className="h-[400px] w-full flex items-center justify-center">

  <img
    src={med?.image || "https://via.placeholder.com/400"}
    alt={med?.name}
    onError={(e) => {
      e.currentTarget.src =
        "https://via.placeholder.com/400?text=No+Image";
    }}
    className="h-[320px] w-auto object-contain block mx-auto"
  />

</div>


      {/* RIGHT SIDE - DETAILS */}
      <div className="p-8 flex flex-col justify-between">

        {/* TOP */}
        <div>

          {/* BACK */}
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-teal-600 hover:underline mb-4"
          >
            ← Back
          </button>

          {/* NAME */}
          <h1 className="text-3xl font-bold text-gray-800">
            {med?.name}
          </h1>

          {/* PHARMACY */}
          <p className="text-gray-500 mt-1">
            Sold by:{" "}
            <span className="font-medium text-gray-700">
              {med?.pharmacyName || "Unknown Pharmacy"}
            </span>
          </p>

          {/* PRICE */}
          <p className="text-2xl font-bold text-teal-600 mt-3">
            ₹{med?.price}
          </p>

          {/* STOCK */}
          <p
            className={`mt-2 text-sm font-medium ${
              med?.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {med?.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          {/* DESCRIPTION */}
          <p className="text-gray-600 mt-4 leading-relaxed">
            {med?.description || "No description available"}
          </p>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="mt-6">

          {/* QUANTITY */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-gray-600 font-medium">Quantity:</span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                −
              </button>

              <span className="font-semibold text-lg">{quantity}</span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={addToCart}
            disabled={med?.stock === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold text-lg shadow-md hover:scale-[1.02] hover:shadow-lg transition disabled:opacity-50"
          >
            Add to Cart 🛒
          </button>

        </div>
      </div>
    </div>
  </div>
);
}

export default MedicineDetails;
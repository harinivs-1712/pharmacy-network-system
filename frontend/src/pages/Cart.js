import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Cart() {
  // ✅ initialize safely (no null crash)
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCart();
  }, []);

  /* ---------------- FETCH CART ---------------- */
  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:5000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // ✅ ensure structure is always valid
      setCart(data && data.items ? data : { items: [] });

    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE QUANTITY ---------------- */
  const updateQty = async (id, qty) => {
    if (qty < 1) return;

    try {
      await fetch(`http://localhost:5000/cart/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: qty }),
      });

      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/cart/remove/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Item removed");
      fetchCart();
    } catch {
      toast.error("Remove failed");
    }
  };

  /* ---------------- TOTAL ---------------- */
  const total = cart.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* ---------------- CHECKOUT ---------------- */
  const checkout = async () => {
    try {
      const res = await fetch("http://localhost:5000/cart/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      toast.success("Order placed 🎉");
      setCart({ items: [] }); // clear UI
    } catch {
      toast.error("Checkout failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 p-6">

    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Cart 🛒</h1>

        <div className="bg-white px-5 py-2 rounded-full shadow text-teal-600 font-semibold">
          {cart.items.length} items
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {cart.items.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
                Your cart is empty 🛒
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.medicineId}
                  className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition flex flex-col md:flex-row md:justify-between gap-4"
                >

                  {/* LEFT CONTENT */}
                  <div className="flex-1">

                    <h2 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Pharmacy: {cart.pharmacyName || "Unknown"}
                    </p>

                    <p className="text-teal-600 font-semibold mt-2">
                      ₹{item.price}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() =>
                          updateQty(item.medicineId, item.quantity - 1)
                        }
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                      >
                        −
                      </button>

                      <span className="font-semibold text-gray-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQty(item.medicineId, item.quantity + 1)
                        }
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* RIGHT CONTENT */}
                  <div className="text-right flex flex-col justify-between">

                    <p className="text-xl font-bold text-gray-800">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() => removeItem(item.medicineId)}
                      className="text-red-500 text-sm hover:underline mt-3"
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white rounded-2xl shadow-md p-6 h-fit sticky top-6">

            <h2 className="text-xl font-bold mb-5 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-3 text-gray-600">

              <div className="flex justify-between">
                <span>Total Items</span>
                <span>{cart.items.length}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={cart.items.length === 0}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold text-lg shadow-md hover:scale-[1.02] hover:shadow-lg transition disabled:opacity-50"
            >
              Place Order
            </button>

          </div>

        </div>
      )}
    </div>
  </div>
);
}

export default Cart;
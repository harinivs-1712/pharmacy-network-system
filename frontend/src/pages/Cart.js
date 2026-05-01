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
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-2xl font-bold mb-6">Shopping Cart 🛒</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-4">

            {cart.items.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.medicineId}
                  className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                >
                  {/* LEFT */}
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>

                    <p className="text-sm text-gray-500">
                      Pharmacy: {cart.pharmacyId}
                    </p>

                    <p className="text-gray-600">₹{item.price}</p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQty(item.medicineId, item.quantity - 1)
                        }
                        className="px-2 bg-gray-200 rounded"
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQty(item.medicineId, item.quantity + 1)
                        }
                        className="px-2 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ₹{item.price * item.quantity}
                    </p>

                    <button
                      onClick={() => removeItem(item.medicineId)}
                      className="text-red-500 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white p-5 rounded-xl shadow h-fit">

            <h2 className="font-bold mb-4">Price Details</h2>

            <div className="flex justify-between mb-2">
              <span>Total Items</span>
              <span>{cart.items.length}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={checkout}
              disabled={cart.items.length === 0}
              className="w-full mt-4 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              Place Order
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
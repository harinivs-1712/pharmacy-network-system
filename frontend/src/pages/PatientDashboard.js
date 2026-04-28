import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";

function PatientDashboard({ orders, setOrders }) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [sortType, setSortType] = useState("price");
    const [inStockOnly, setInStockOnly] = useState(false);
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/medicines")
            .then((res) => res.json())
            .then((data) => setMedicines(data));
    }, []);


    let filtered = medicines.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase())
    );

    // In-stock filter
    if (inStockOnly) {
        filtered = filtered.filter((m) => m.stock > 0);
    }

    const grouped = {};

    filtered.forEach((m) => {
        if (!grouped[m.name]) {
            grouped[m.name] = [];
        }
        grouped[m.name].push(m);
    });

    Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
            if (sortType === "price") return a.price - b.price;
            if (sortType === "distance") return a.distance - b.distance;
            return 0;
        });
    });

    const handleConfirm = async () => {
        if (!selected) return;

        const orderPayload = {
            name: selected.name,
            price: selected.price,
            pharmacy: selected.pharmacy,
            status: "Pending",
        };

        await fetch("http://localhost:5000/add-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
        });

        if (setOrders) {
            setOrders([...orders, orderPayload]);
        }

        setSelected(null);
    };

    const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

const token = localStorage.getItem("token");

if (!token) return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* View Orders */}
            <button
                onClick={() => navigate("/orders")}
                className="mb-4 bg-purple-500 text-white px-4 py-2 rounded-lg"
            >
                View Orders
            </button>

            <h1 className="text-2xl font-bold mb-4">
                Search Medicines 💊
            </h1>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search medicine..."
                className="w-full p-3 mb-6 rounded-xl border focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setQuery(e.target.value)}
            />

            <div className="flex gap-4 mb-4">

                <select
                    className="p-2 border rounded"
                    onChange={(e) => setSortType(e.target.value)}
                >
                    <option value="price">Sort by Price</option>
                    <option value="distance">Sort by Distance</option>
                </select>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    In Stock Only
                </label>

            </div>

            {/* Results */}
            <div className="space-y-4">

                {filtered.length === 0 ? (
                    <p className="text-gray-500">No medicines found</p>
                ) : (
                    Object.keys(grouped).map((medName) => (
                        <div key={medName} className="mb-6">

                            <h2 className="text-xl font-bold mb-2 capitalize">
                                {medName}
                            </h2>

                            <div className="space-y-3">
                                {grouped[medName].map((m, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold">{m.pharmacy}</p>
                                            <p className="text-sm text-gray-500">
                                                {m.distance} km away
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-bold">₹{m.price}</p>

                                            {/* 🔥 Best Price Badge */}
                                            {m.price === Math.min(...grouped[medName].map(x => x.price)) && (
                                                <span className="block text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                                    Best Price
                                                </span>
                                            )}

                                            <button
                                                onClick={() => setSelected(m)}
                                                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-lg"
                                            >
                                                Order
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))

                )
                }
            </div>

            {/* Confirm Order Popup */}
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
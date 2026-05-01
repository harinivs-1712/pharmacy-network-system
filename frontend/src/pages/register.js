

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [coords, setCoords] = useState(null);

  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ---------------- LOCATION ---------------- */
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // ✅ FIXED (object)
        setCoords({
          lat: latitude,
          lng: longitude,
        });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await res.json();
          const addr = data.address;

          const cityName =
            addr.city || addr.town || addr.village || "Unknown";

          const stateName = addr.state || "Unknown";

          setCity(cityName.toLowerCase());
          setState(stateName);
          setAddress(data.display_name);

          toast.success("Location fetched 📍");
        } catch {
          setAddress(`${latitude}, ${longitude}`);
          toast.error("Using coordinates only");
        }

        setLocLoading(false);
      },
      () => {
        toast.error("Permission denied");
        setLocLoading(false);
      }
    );
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Fill all fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be 6+ characters");
      return;
    }

    if (!coords) {
      toast.error("Please fetch location 📍");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          address,
          city,
          state,
          coords,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Registered successfully 🎉");
      navigate("/");
    } catch {
      toast.error("Network error");
    }

    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account 🚀
        </h2>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 mb-3 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* ROLE */}
        <select
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="patient">Patient</option>
          <option value="pharmacy">Pharmacy</option>
        </select>

        {/* LOCATION BUTTON */}
        <button
          type="button"
          onClick={getLocation}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded mb-3"
        >
          {locLoading ? "Fetching..." : "Use Current Location 📍"}
        </button>

        {/* ADDRESS */}
        <input
          placeholder="Address"
          className="w-full p-2 mb-2 border rounded-lg"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* CITY */}
        <input
          placeholder="City"
          className="w-full p-2 mb-2 border rounded-lg"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        {/* STATE */}
        <input
          placeholder="State"
          className="w-full p-2 mb-4 border rounded-lg"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />

        {/* REGISTER */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* BACK */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-2 bg-gray-500 text-white p-2 rounded-lg"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default Register;
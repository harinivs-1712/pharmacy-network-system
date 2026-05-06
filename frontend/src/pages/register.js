

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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 px-4">

    <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-white">

      {/* LEFT PANEL */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-teal-400 via-teal-500 to-green-500 items-center justify-center text-white relative">

        {/* Glow */}
        <div className="absolute w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative text-center px-6">
          <p className="text-sm tracking-widest mb-4 opacity-80">JOIN US</p>
          <h2 className="text-5xl font-extrabold">REGISTER</h2>
          <p className="mt-4 text-sm opacity-80">
            Create your account to get started
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="w-full md:w-3/5 p-8 md:p-12 h-[600px] overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-green-500 text-white text-2xl shadow-lg">
            📝
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Fill in your details</p>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password (6+ characters)"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* ROLE */}
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="patient">Patient</option>
            <option value="pharmacy">Pharmacy</option>
          </select>

          {/* LOCATION BUTTON */}
          <button
            type="button"
            onClick={getLocation}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            {locLoading ? "Fetching Location..." : "Use Current Location 📍"}
          </button>

          {/* ADDRESS */}
          <input
            placeholder="Address"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* CITY */}
          <input
            placeholder="City"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          {/* STATE */}
          <input
            placeholder="State"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />

          {/* REGISTER BUTTON */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold text-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition"
          >
            {loading ? "Registering..." : "CREATE ACCOUNT"}
          </button>
        </div>

        {/* LOGIN LINK */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-teal-600 font-semibold hover:underline"
          >
            Login
          </button>
        </p>

      </div>
    </div>
  </div>
);
}

export default Register;
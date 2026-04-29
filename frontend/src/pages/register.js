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
  const [coords, setCoords] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 📍 Location fetch
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords(`${latitude}, ${longitude}`);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await res.json();
          const addr = data.address;

          const cityName =
            addr.city || addr.town || addr.village || "Unknown";
          const stateName = addr.state || "Unknown";

          setCity(cityName);
          setState(stateName);
          setAddress(data.display_name);

          toast.success("Location fetched");
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

  // 📝 Register handler
  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
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

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        toast.error(error?.message || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Registered successfully!");
      navigate("/");
    } catch {
      toast.error("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Register
        </h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 mb-3 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* Role */}
        <select
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="patient">Patient</option>
          <option value="pharmacy">Pharmacy</option>
        </select>

        {/* 📍 Location Button */}
        <button
          type="button"
          onClick={getLocation}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded mb-3"
        >
          {locLoading ? "Fetching..." : "Use Current Location 📍"}
        </button>

        {/* Address */}
        <input
          placeholder="Address"
          className="w-full p-2 mb-3 border rounded-lg"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* City */}
        <input
          placeholder="City"
          className="w-full p-2 mb-3 border rounded-lg"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        {/* State */}
        <input
          placeholder="State"
          className="w-full p-2 mb-4 border rounded-lg"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />

        {/* Register */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-2 bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default Register;
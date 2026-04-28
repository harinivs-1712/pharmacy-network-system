import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Validate all fields are filled
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        alert(error?.message || "Registration failed");
        return;
      }

      alert("Registered successfully! Please login.");
      navigate("/");
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-80">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) => setForm({...form, name: e.target.value})}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) => setForm({...form, email: e.target.value})}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) => setForm({...form, password: e.target.value})}
        />

        <select
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) => setForm({...form, role: e.target.value})}
        >
          <option value="patient">Patient</option>
          <option value="pharmacy">Pharmacy</option>
        </select>

        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Register
        </button>

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
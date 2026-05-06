import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.message || "Login failed");
        return;
      }

      const data = await res.json();

      if (!data?.token || !data?.user) {
        alert("Invalid server response");
        return;
      }

      // ✅ Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Role-based navigation
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "pharmacy") navigate("/pharmacy");
      else navigate("/patient");

    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 px-4">

    <div className="w-full max-w-6xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-white">

      {/* LEFT SIDE */}
      <div className="hidden md:flex md:w-2/5 relative bg-gradient-to-br from-teal-400 via-teal-500 to-green-500 items-center justify-center">

        {/* Glow effect */}
        <div className="absolute w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative text-center text-white px-6">
          <p className="text-sm tracking-widest mb-4 opacity-80">ACCESS PANEL</p>
          <h2 className="text-5xl font-extrabold tracking-wide">LOGIN</h2>
          <p className="mt-4 text-sm opacity-80">
            Secure access to your pharmacy dashboard
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-3/5 p-8 md:p-12">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-green-500 text-white text-2xl shadow-lg">
            🔐
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Login to continue</p>
        </div>

        {/* Form */}
        <div className="space-y-6">

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Options */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>

            <button className="text-teal-600 hover:underline">
              Forgot Password?
            </button>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold text-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Register */}
        <p className="text-center text-sm text-gray-600">
          New here?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-teal-600 font-semibold hover:underline"
          >
            Create account
          </button>
        </p>

      </div>
    </div>
  </div>
);
}

export default Login;
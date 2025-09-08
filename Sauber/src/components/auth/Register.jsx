import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config" 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import signcar from "../../assets/image/signcar.png";
import logo from "../../assets/image/logo.png";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Save extra data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        role: "cashier", // default role
        createdAt: new Date(),
      });

      // Redirect to cashier dashboard
      navigate("/cashier/dashboard");
    } catch (err) {
      console.error("Register error:", err.message);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else {
        setError("Failed to create account. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 lg:flex flex-col justify-center items-center p-8 relative overflow-hidden hidden">
        <div className="absolute top-8 left-8">
          <img src={logo} alt="Logo" className="w-24 h-16" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <img
              src={signcar}
              alt="Sign Illustration"
              className="w-[400px] h-[300px] object-cover"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-12">
          Optimize your business
        </h2>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-[40%] bg-white flex flex-col justify-center p-8">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p className="text-gray-600 mb-8">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-purple-600 hover:text-purple-700 ml-1 font-medium"
            >
              Sign in
            </button>
          </p>

          {error && (
            <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>
          )}

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Register Button */}
            <button
              className="w-full bg-[#604BE8] text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";

import car from "../../assets/image/car.png";
import logo from "../../assets/image/logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Get role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // If user doc doesn't exist, create a default role and doc
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "cashier", // or choose a default role
          createdAt: new Date(),
        });
        // Refetch the user doc
        const newUserDoc = await getDoc(doc(db, "users", user.uid));
        const userData = newUserDoc.data();
        const role = userData.role;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "cashier") {
          navigate("/cashier/dashboard");
        } else {
          throw new Error("Unauthorized role. Contact admin.");
        }
      } else {
        const userData = userDoc.data();
        const role = userData.role;
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "cashier") {
          navigate("/cashier/dashboard");
        } else {
          throw new Error("Unauthorized role. Contact admin.");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Illustration */}
      <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 lg:flex flex-col justify-center items-center p-8 relative overflow-hidden max-w-full hidden">
        <div className="absolute top-8 left-8">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-24 h-16" />
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <img src={car} alt="" className="w-[400px] h-[300px] object-cover" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-12">Optimize your business</h2>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-[40%] bg-white flex flex-col justify-center p-8 w-full">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p className="text-gray-600 mb-8">Login to access your account</p>

          <div className="space-y-6">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Sign In Button */}
            <button
              className="w-full bg-[#604BE8] text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

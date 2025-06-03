import React, { useState } from "react";
import { loginUser } from "../api/loginService"; // import your new login service
import { useNavigate } from "react-router-dom";
import logo from "../assets/clinic.jpg";

const LoginPage = ({ setLoggedInUser }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(userId, password);

      if (user) {
        console.log("Login successful:", user);
        setLoggedInUser(user);

        if (user.role === "admin") {
          navigate("/dashboard");
        } else if (user.role === "staff") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("An error occurred during login. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Shri Clinic Veterinary Logo"
            className="h-24 w-24 object-contain mb-4 rounded-full border-4 border-indigo-200 shadow-md"
          />
          <h2 className="text-4xl font-bold text-gray-800 text-center">
            Sri Veterinary Clinic
          </h2>
          <p className="text-xl text-gray-600 mt-2">Administrator Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-indigo-400 transition duration-200 text-lg"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-indigo-400 transition duration-200 text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm font-medium text-center -mt-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-3 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 transition duration-300 transform active:scale-95 text-lg font-semibold flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

export default function App() {
  const [stage, setStage] = useState("base");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      {stage === "base" && (
        <div>
          <p>🧩 Testing providers step-by-step...</p>
          <button
            onClick={() => setStage("auth")}
            className="mt-3 px-4 py-2 bg-blue-500 rounded"
          >
            Next ➜ Add AuthProvider
          </button>
        </div>
      )}

      {stage === "auth" && (
        <AuthProvider>
          <div className="text-center">
            <p>✅ AuthProvider Loaded Successfully</p>
            <button
              onClick={() => setStage("theme")}
              className="mt-3 px-4 py-2 bg-blue-500 rounded"
            >
              Next ➜ Add ThemeProvider
            </button>
          </div>
        </AuthProvider>
      )}

      {stage === "theme" && (
        <AuthProvider>
          <ThemeProvider>
            <div className="text-center">
              <p>✅ ThemeProvider Loaded Successfully</p>
              <button
                onClick={() => setStage("cart")}
                className="mt-3 px-4 py-2 bg-blue-500 rounded"
              >
                Next ➜ Add CartProvider
              </button>
            </div>
          </ThemeProvider>
        </AuthProvider>
      )}

      {stage === "cart" && (
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <div className="text-center">
                <p>✅ CartProvider Loaded Successfully</p>
                <button
                  onClick={() => setStage("home")}
                  className="mt-3 px-4 py-2 bg-blue-500 rounded"
                >
                  Next ➜ Load Home Page
                </button>
              </div>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      )}

      {stage === "home" && (
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <div className="w-full flex flex-col items-center">
                <Navbar />
                <Home />
              </div>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      )}
    </div>
  );
}

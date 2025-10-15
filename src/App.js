import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";

// --- Pages ---
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import OrderHistory from "./pages/OrderHistory";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import MessagesPage from "./pages/MessagesPage";
import AdminKYCPanel from "./pages/AdminKYCPanel";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 🌀 Splash logic
  useEffect(() => {
    console.log("✅ Splash mounted");
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      console.log("➡️ Splash fading out");
    }, 2000);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
      console.log("🧹 Splash removed — main app should now render");
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // 🌀 While splash is visible
  if (showSplash) {
    console.log("⏳ Rendering Splash...");
    return (
      <div>
        <SplashScreen fadeOut={fadeOut} />
        <p
          style={{
            color: "white",
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          Splash Screen Mounted ✅
          <br />
          (If you see this forever, React never unmounted it)
        </p>
      </div>
    );
  }

  // 🚀 Main app after splash
  console.log("🚀 Rendering main app");

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <HashRouter>
              {/* ✅ Fix applied here */}
              <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Navbar />

                <main className="container mx-auto px-4 py-8 flex-1 text-center">
                  {/* Optional debug line */}
                  <h2 className="text-xl mb-4">
                    🟢 React Router Active
                  </h2>

                  <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/product/:productId"
                      element={<ProductDetail />}
                    />

                    {/* --- Protected Routes --- */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute roles={["Buyer"]}>
                          <CartPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute roles={["Seller"]}>
                          <SellerDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- Messages --- */}
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages/:conversationId"
                      element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- Admin --- */}
                    <Route
                      path="/admin/kyc"
                      element={
                        <ProtectedRoute roles={["Admin"]}>
                          <AdminKYCPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- Fallback --- */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>
              </div>
            </HashRouter>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

// src/App.js
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";

// Pages
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

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500);
    const removeTimer = setTimeout(() => setShowSplash(false), 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen fadeOut={fadeOut} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <div className="dark:bg-gray-900 min-h-screen flex flex-col bg-gray-900 text-gray-100 transition-colors duration-300">
              <Navbar />
              <main className="container mx-auto px-4 py-8 flex-1">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />

                  {/* Protected */}
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

                  {/* Messages */}
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

                  {/* Admin */}
                  <Route
                    path="/admin/kyc"
                    element={
                      <ProtectedRoute roles={["Admin"]}>
                        <AdminKYCPanel />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

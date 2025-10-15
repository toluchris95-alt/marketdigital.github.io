import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";

// --- Contexts (wrapped with try/catch below) ---
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";

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

// Simple inline ErrorBoundary to expose crashes
function SafeBoundary({ children }) {
  const [error, setError] = useState(null);
  if (error)
    return (
      <div className="bg-red-900 text-white p-6 text-center">
        <h2 className="text-xl font-bold mb-2">❌ Application Crash</h2>
        <p>{error.message || "Unknown error"}</p>
        <pre className="text-sm mt-4 bg-black/30 p-2 rounded">
          {error.stack}
        </pre>
      </div>
    );

  try {
    return children;
  } catch (e) {
    setError(e);
    return null;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500);
    const removeTimer = setTimeout(() => setShowSplash(false), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (showSplash) return <SplashScreen fadeOut={fadeOut} />;

  return (
    <SafeBoundary>
      <React.StrictMode>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <HashRouter>
                <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  <Navbar />
                  <main className="container mx-auto px-4 py-8 flex-1 text-center">
                    <h2 className="text-xl mb-4">🟢 React Router Active</h2>

                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/product/:productId"
                        element={<ProductDetail />}
                      />
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
                      <Route
                        path="/admin/kyc"
                        element={
                          <ProtectedRoute roles={["Admin"]}>
                            <AdminKYCPanel />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </main>
                </div>
              </HashRouter>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </React.StrictMode>
    </SafeBoundary>
  );
}

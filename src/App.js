// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

// --- Components ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// --- Pages ---
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';
import OrderHistory from './pages/OrderHistory';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import MessagesPage from './pages/MessagesPage';
import AdminKYCPanel from './pages/AdminKYCPanel'; // ✅ NEW import (Admin panel)

// -----------------------------------------------------

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <div className="dark:bg-gray-900 min-h-screen flex flex-col">
              {/* --- Navbar --- */}
              <Navbar />

              {/* --- Main content area --- */}
              <main className="container mx-auto px-4 py-8 flex-1">
                <Routes>

                  {/* ---------- PUBLIC ROUTES ---------- */}
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />

                  {/* ---------- PROTECTED ROUTES ---------- */}
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
                      <ProtectedRoute roles={['Buyer']}>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute roles={['Seller']}>
                        <SellerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* ---------- MESSAGES ROUTES ---------- */}
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

                  {/* ---------- ADMIN ROUTES ---------- */}
                  <Route
                    path="/admin/kyc"
                    element={
                      <ProtectedRoute roles={['Admin']}>
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

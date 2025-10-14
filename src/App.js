import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';
import OrderHistory from './pages/OrderHistory';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <div className="dark:bg-gray-900 min-h-screen">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  
                  {/* Protected Routes */}
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute roles={['Buyer']}><CartPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute roles={['Seller']}><SellerDashboard /></ProtectedRoute>} />
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

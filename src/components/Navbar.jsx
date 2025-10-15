import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCartIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* --- Logo / Brand --- */}
          <Link
            to="/"
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight hover:opacity-80"
          >
            Digital Assets
          </Link>

          {/* --- Right-side Icons & Links --- */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6" />
              ) : (
                <SunIcon className="h-6 w-6" />
              )}
            </button>

            {currentUser ? (
              <>
                {/* Seller Dashboard */}
                {userData?.role === 'Seller' && (
                  <Link
                    to="/dashboard"
                    title="Seller Dashboard"
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <BuildingStorefrontIcon className="h-6 w-6" />
                  </Link>
                )}

                {/* Orders (Buyer) */}
                {userData?.role === 'Buyer' && (
                  <Link
                    to="/orders"
                    title="My Orders"
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />
                  </Link>
                )}

                {/* 🟢 Messages Link */}
                <Link
                  to="/messages"
                  title="Messages"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </Link>

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile & Logout */}
                <div className="flex items-center space-x-2">
                  <Link to="/profile">
                    {userData?.profilePictureUrl ? (
                      <img
                        src={userData.profilePictureUrl}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                        {currentUser.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

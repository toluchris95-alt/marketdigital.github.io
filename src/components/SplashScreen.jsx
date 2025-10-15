// src/components/SplashScreen.jsx
import React from "react";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50">
      <div className="text-center animate-fadeIn">
        {/* 🔄 Spinner */}
        <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>

        {/* 🏷️ Brand Title */}
        <h1 className="text-4xl font-extrabold tracking-wide mb-2">
          Digital Asset Marketplace
        </h1>

        {/* 💬 Tagline */}
        <p className="text-gray-400 text-lg">
          Loading your experience...
        </p>
      </div>
    </div>
  );
}

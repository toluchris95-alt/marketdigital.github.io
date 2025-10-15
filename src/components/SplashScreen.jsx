// src/components/SplashScreen.jsx
import React from "react";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50">
      <div className="text-center animate-fadeIn">
        <h1 className="text-4xl font-extrabold tracking-wide mb-3">
          Digital Asset Marketplace
        </h1>
        <p className="text-gray-400 text-lg">Loading your experience...</p>
      </div>
    </div>
  );
}

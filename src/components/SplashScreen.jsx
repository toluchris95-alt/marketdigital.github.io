import React from "react";

export default function SplashScreen({ fadeOut }) {
  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50 transition-opacity duration-1000 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mb-4"></div>
      <h1 className="text-3xl font-extrabold mb-2">
        Digital Asset Marketplace
      </h1>
      <p className="text-gray-400">Loading your experience...</p>
    </div>
  );
}

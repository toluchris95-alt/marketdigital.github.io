import React, { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";

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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #001F3F, #0074D9)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
      }}
    >
      <p>✅ React is running and Splash unmounted</p>
      <p>Now rendering plain App.js</p>
    </div>
  );
}

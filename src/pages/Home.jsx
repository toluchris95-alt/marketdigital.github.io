import React from "react";

export default function Home() {
  console.log("🏠 Home mounted");
  return (
    <div
      style={{
        color: "black",
        fontSize: "22px",
        textAlign: "center",
        marginTop: "80px",
      }}
    >
      ✅ Home Component Rendered Successfully
    </div>
  );
}

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("🛑 React crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            backgroundColor: "#0f172a",
            color: "white",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h2>⚠️ Something went wrong.</h2>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <p style={{ opacity: 0.6, fontSize: "12px" }}>
            Check console for full trace.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

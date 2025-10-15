export default function SplashScreen() {
  return (
    <div
      style={{
        background: "black",
        color: "white",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
      }}
    >
      Splash Screen Mounted ✅
      <br />
      (If you see this forever, it never unmounts)
    </div>
  );
}

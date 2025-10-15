function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <HashRouter>
            <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 transition-colors duration-300">
              <div style={{ textAlign: "center", marginTop: 50 }}>
                ⚡ App Mounted — Splash removed for test
              </div>
              <Navbar />
              <main className="container mx-auto px-4 py-8 flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                </Routes>
              </main>
            </div>
          </HashRouter>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

import AppRoutes from "./routes/AppRoutes";

function App() {
  return <AppRoutes />;
  <Route path="/products/*" element={<ProductRoutes />} />
}

export default App;
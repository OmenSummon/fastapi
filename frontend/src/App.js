import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Game from "@/pages/Game";
import Rewards from "@/pages/Rewards";
import Cart from "@/pages/Cart";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import ProtectedRoute from "@/components/ProtectedRoute";

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (synchronous during render)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:productId" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      
      {/* Protected Routes */}
      <Route path="/game" element={
        <ProtectedRoute>
          <Game />
        </ProtectedRoute>
      } />
      <Route path="/rewards" element={
        <ProtectedRoute>
          <Rewards />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
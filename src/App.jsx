import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, BrowserRouter as Router, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";
import AiAssistant from "../components/AiAssistant";
// Lazy load pages
// Note: Naming convention ke hisab se 'ProductCard' ko 'Shop' ya 'Home' kehna behtar hai, 
// lekin filhal apke structure ke mutabiq chal raha hun.
const ShopPage = lazy(() => import("./customer/ProductCard")); 
const ViewCart = lazy(() => import("./customer/ViewCart"));
const ProductDetailPage = lazy(() => import("./customer/ProductDetail"));
const Order = lazy(() => import("./customer/Order"));

// Admin Components
const Product = lazy(() => import("./admin/Product"));
const AddProduct = lazy(() => import("./admin/AddProduct"));
const AdminLogin = lazy(() => import("./admin/adminLogin"));

// --- UTILITY: Scroll To Top on Route Change ---
// Shopify feel ke liye zaroori hai ke jab naya page khulay to user top par ho.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- COMPONENT: Professional Loading Spinner ---
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
        
        {/* Header Sticky Rehta hai usually */}
        <div className="sticky top-0 z-50 bg-white shadow-sm">
          <Header />
        </div>

        {/* Main Content Area */}
        {/* Note: Maine yahan se 'max-w-7xl' hata diya hai taake Banners full width aa saken.
            Ab har page (ShopPage, ProductDetail) apni width khud control karega container se. */}
        <main className="flex-1 w-full">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<ShopPage />} />
              <Route path="/productDetail/:id" element={<ProductDetailPage />} />
              <Route path="/viewcart" element={<ViewCart />} />
              <Route path="/order" element={<Order />} />
              
              {/* Auth Route */}
              <Route path="/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route
                path="/products"
                element={
                  <ProtectedAdminRoute>
                    <div className="max-w-7xl mx-auto px-4 py-6">
                       <Product />
                    </div>
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/add-product"
                element={
                  <ProtectedAdminRoute>
                    <div className="max-w-4xl mx-auto px-4 py-6">
                      <AddProduct mode="add" />
                    </div>
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/edit-product/:id"
                element={
                  <ProtectedAdminRoute>
                    <div className="max-w-4xl mx-auto px-4 py-6">
                      <AddProduct mode="edit" />
                    </div>
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <AiAssistant />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
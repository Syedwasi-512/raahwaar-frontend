import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  getAllProducts,
  deleteProduct,
  getAllOrders,
  adminLogout,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUp,
  ArrowDown,
  Loader2,
  ImageIcon,
  ShoppingBag,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";

// --- SHARED COMPONENTS ---

const StatusBadge = ({ quantity }) => {
  if (quantity > 10)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-tight">
        <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5"></span>In
        Stock
      </span>
    );
  if (quantity > 0)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-tight">
        <span className="w-1 h-1 bg-amber-500 rounded-full mr-1.5"></span>Low
        Stock
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-tight">
      <span className="w-1 h-1 bg-gray-400 rounded-full mr-1.5"></span>Out of
      Stock
    </span>
  );
};

const OrderStatusBadge = ({ confirmed }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
      confirmed
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-orange-50 text-orange-700 border-orange-100"
    }`}
  >
    {confirmed ? "Confirmed" : "Pending"}
  </span>
);

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const itemsPerPage = 10;

  // --- 1. SESSION MANAGEMENT (LOGOUT) ---
  const handleLogout = async () => {
    if (window.confirm("End admin session?")) {
      setIsLoggingOut(true);
      try {
        await adminLogout();
      } catch (err) {
        console.error("Session cleanup failed");
      } finally {
        localStorage.clear(); 
        sessionStorage.clear();
        setIsLoggingOut(false);
        
        window.location.href = "/login";
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        setDeletingId(id);
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (error) {
        alert("Failed to delete product.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // --- 2. DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        const res = await getAllProducts();
        setProducts(res.data || []);
      } else {
        const res = await getAllOrders();
        setOrders(res.data?.orders || []);
      }
    } catch (error) {
      console.error(`Fetch error:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    setSearch("");
    setCurrentPage(1);
  }, [fetchData]);

  // --- 3. FILTERING & SORTING LOGIC ---
  const processedProducts = useMemo(() => {
    let result = products.filter(
      (p) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.brandId?.name?.toLowerCase().includes(search.toLowerCase())
    );
    return result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, search, sortConfig]);

  const processedOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return orders;
    return orders.filter((o) => {
      const matchesText =
        o.name?.toLowerCase().includes(query) ||
        o.email?.toLowerCase().includes(query) ||
        o._id?.includes(query);
      let matchesStatus = false;
      if ("confirmed".startsWith(query) || query === "confirmed")
        matchesStatus = o.isConfirmed === true;
      else if ("pending".startsWith(query) || query === "pending")
        matchesStatus = o.isConfirmed === false;
      return matchesText || matchesStatus;
    });
  }, [orders, search]);

  const displayData =
    activeTab === "products" ? processedProducts : processedOrders;
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = displayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F6F6F7] text-[#1A1A1A] antialiased pb-20">
      {/* --- TOP HEADER (Responsive) --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm sm:text-xl font-black tracking-[0.2em] uppercase truncate">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "products" && (
              <button
                onClick={() => navigate("/admin/add-product")}
                className="p-2 sm:px-4 sm:py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> 
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest">
                  Add Product
                </span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 sm:px-4 sm:py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 border border-transparent hover:border-red-100"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-widest">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 mt-6 space-y-6">
        {/* --- TAB NAVIGATION (Shopify Style) --- */}
        <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === "products"
                ? "border-black text-black"
                : "border-transparent text-gray-400"
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-black text-black"
                : "border-transparent text-gray-400"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* --- TOOLBAR --- */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-black outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={fetchData}
            className="hidden sm:flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-black transition-all"
          >
            <Loader2 size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* --- DATA AREA --- */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-gray-300 mb-2" size={32} />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Syncing Database...
              </p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Package size={48} className="mx-auto text-gray-100" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                No Records Found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* === DESKTOP TABLE === */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <tr>
                    <th className="px-6 py-4">
                      {activeTab === "products" ? "Item" : "Order ID"}
                    </th>
                    <th className="px-6 py-4">
                      {activeTab === "products" ? "Brand" : "Customer"}
                    </th>
                    <th className="px-6 py-4 text-center">
                      {activeTab === "products" ? "Stock" : "Items"}
                    </th>
                    <th className="px-6 py-4">
                      {activeTab === "products" ? "Price" : "Total"}
                    </th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedData.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {activeTab === "products" ? (
                        <>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                              <img
                                src={
                                  item.images?.[0]?.url || "/placeholder.png"
                                }
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </div>
                            <span className="text-[13px] font-bold truncate max-w-[180px]">
                              {item.title}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                            {item.brandId?.name || "—"}
                          </td>
                          <td className="px-6 py-4 text-center text-xs font-bold">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-black">
                            Rs. {item.finalPrice?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <StatusBadge quantity={item.quantity} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  navigate(`/admin/edit-product/${item._id}`)
                                }
                                className="p-2 hover:bg-white rounded-md border border-transparent hover:border-gray-200"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(item._id)}
                                disabled={deletingId === item._id}
                                className="p-2 hover:bg-white rounded-md text-red-500 border border-transparent hover:border-red-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">
                              #{item._id.slice(-6)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {item.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-xs font-bold">
                            {item.products?.length}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-black text-emerald-600">
                            Rs. {item.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <OrderStatusBadge confirmed={item.isConfirmed} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-gray-400 hover:text-black">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* === MOBILE LIST CARDS === */}
              <div className="md:hidden divide-y divide-gray-100">
                {paginatedData.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 space-y-3 active:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      {activeTab === "products" ? (
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                            <img
                              src={item.images?.[0]?.url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold leading-tight line-clamp-1">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-black mt-1 tracking-widest">
                              {item.brandId?.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black font-mono text-gray-400 uppercase mb-1">
                            ID: #{item._id.slice(-6)}
                          </span>
                          <span className="text-[13px] font-bold">
                            {item.name}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-black">
                          {activeTab === "products"
                            ? `Rs. ${item.finalPrice?.toLocaleString()}`
                            : `Rs. ${item.totalAmount?.toLocaleString()}`}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {activeTab === "products"
                            ? `Qty: ${item.quantity}`
                            : `${item.products?.length} Items`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {activeTab === "products" ? (
                        <StatusBadge quantity={item.quantity} />
                      ) : (
                        <OrderStatusBadge confirmed={item.isConfirmed} />
                      )}

                      <div className="flex gap-2">
                        {activeTab === "products" ? (
                          <>
                            <button
                              onClick={() =>
                                navigate(`/admin/edit-product/${item._id}`)
                              }
                              className="p-2 border border-gray-200 rounded-lg text-gray-600"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button className="p-2 border border-gray-200 rounded-lg text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600">
                            Details <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- PAGINATION (Minimalist) --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-2 text-gray-400 hover:text-black disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 text-gray-400 hover:text-black disabled:opacity-20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

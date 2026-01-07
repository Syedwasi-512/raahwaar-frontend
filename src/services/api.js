import axios from "axios";

/**
 * 1. Base Configuration
 * Live hone par baseURL change karna parta hai, isliye hum Environment Variables use karte hain.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Zaroori hai cookies (Cart logic) handle karne ke liye
  timeout: 60000, // 60 seconds timeout taake request hang na ho jaye
});



// --- AUTH API ---
export const adminLogin = (data) => api.post("/admin/login", data);
export const adminLogout = () => api.get("/admin/logout");
export const adminChangePassword = (data) => api.put("/admin/change-password", data);

// --- CART API ---
export const getCart = () => api.get("/cart");
export const addToCart = (productId, qty = 1) => api.post("/cart/add", { productId, quantity: qty });
export const updateItem = (itemId, qty) => api.put("/cart/update", { productId: itemId, quantity: qty });
export const removeItem = (itemId) => api.post("/cart/remove", { productId: itemId });
export const clearCart = () => api.post("/cart/clear");

// --- PRODUCTS API ---
export const getAllProducts = () => api.get("/products");
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// --- ORDERS API ---
export const createOrder = (data) => api.post("/orders", data);
export const getAllOrders = () => api.get("/orders");
export const confirmOrder = (id, token) => api.get(`/orders/confirm/${id}/${token}`);

export default api;
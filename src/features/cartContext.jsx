import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateItem as apiUpdateCartItem,
  removeItem as apiRemoveFromCart,
  clearCart as apiClearCart,
} from "../services/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * REFACTOR: Centralized State Updater
   * Backend se jo response aata hai usay clean tareeke se state mein set karta hai.
   */
  const handleCartResponse = useCallback((data) => {
    // Hamare naye controller ka response structure: { cart: { items: [] }, total: 0 }
    const cartItems = data?.cart?.items || [];
    const cartTotal = data?.total || 0;
    
    setItems(cartItems);
    setTotal(cartTotal);
  }, []);

  // --- INITIAL LOAD ---
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCart();
      handleCartResponse(res.data);
    } catch (error) {
      console.error("Cart Loading Error:", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [handleCartResponse]);

  useEffect(() => {
    load();
  }, [load]);

  // --- ADD TO CART ---
  const add = async (productId, qty = 1) => {
    try {
      const res = await apiAddToCart(productId, qty);
      handleCartResponse(res.data);
      return res;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add item to cart";
      console.error("Add Error:", errorMsg);
      throw new Error(errorMsg); // UI can catch this and show a toast/alert
    }
  };

  // --- UPDATE QUANTITY ---
  const update = async (productId, qty) => {
    try {
      const res = await apiUpdateCartItem(productId, qty);
      handleCartResponse(res.data);
      return res;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update quantity";
      console.error("Update Error:", errorMsg);
      throw new Error(errorMsg);
    }
  };

  // --- REMOVE ITEM ---
  const remove = async (productId) => {
    try {
      const res = await apiRemoveFromCart(productId);
      handleCartResponse(res.data);
      return res;
    } catch (error) {
      console.error("Remove Error:", error.message);
      throw error;
    }
  };

  // --- CLEAR CART ---
  const clear = async () => {
    try {
      const res = await apiClearCart();
      // res.data: { success: true, cart: { items: [] }, total: 0 }
      handleCartResponse(res.data);
      return res;
    } catch (error) {
      console.error("Clear Error:", error.message);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        items,      // Current items array
        total,      // Pre-calculated total amount
        loading,    // Initial loading state
        add, 
        update, 
        remove, 
        clear, 
        reload: load 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
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
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper: Backend response ko state mein sync karne ke liye
  const handleCartResponse = useCallback((data) => {
    const cartItems = data?.cart?.items || [];
    const cartTotal = data?.total || 0;
    setItems(cartItems);
    setTotal(cartTotal);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCart();
      handleCartResponse(res.data);
    } catch (error) {
      console.error("Load Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, [handleCartResponse]);

  useEffect(() => { load(); }, [load]);

  // --- 1. ADD TO CART (Optimistic) ---
  const add = async (product, qty = 1) => {
    const previousItems = [...items];
    const previousTotal = total;

    // Frontend par foran update dikhayen
    setItems(prev => {
      const existing = prev.find(i => i.productId === product._id);
      const price = product.finalPrice || product.price;
      
      if (existing) {
        return prev.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { 
        productId: product._id, 
        quantity: qty, 
        finalPrice: price, 
        product: { title: product.title, image: product.images?.[0]?.url, brand: product.brandId?.name } 
      }];
    });
    setTotal(prev => prev + (product.finalPrice || product.price) * qty);

    try {
      const res = await apiAddToCart(product._id, qty);
      handleCartResponse(res.data); // Real data sync
    } catch (error) {
      setItems(previousItems); // Rollback on error
      setTotal(previousTotal);
      throw new Error(error.response?.data?.message || "Failed to add");
    }
  };

  // --- 2. UPDATE QUANTITY (Optimistic) ---
  const update = async (productId, newQty) => {
    const previousItems = [...items];
    const previousTotal = total;

    // Step 1: Update UI instantly
    setItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const diff = newQty - item.quantity;
        setTotal(t => t + (item.finalPrice * diff));
        return { ...item, quantity: newQty };
      }
      return item;
    }));

    try {
      const res = await apiUpdateCartItem(productId, newQty);
      handleCartResponse(res.data);
    } catch (error) {
      setItems(previousItems); // Rollback
      setTotal(previousTotal);
      throw new Error(error.response?.data?.message || "Update failed");
    }
  };

  // --- 3. REMOVE ITEM (Optimistic) ---
  const remove = async (productId) => {
    const previousItems = [...items];
    const previousTotal = total;

    const itemToRemove = items.find(i => i.productId === productId);
    setItems(prev => prev.filter(i => i.productId !== productId));
    if (itemToRemove) setTotal(prev => prev - (itemToRemove.finalPrice * itemToRemove.quantity));

    try {
      const res = await apiRemoveFromCart(productId);
      handleCartResponse(res.data);
    } catch (error) {
      setItems(previousItems); // Rollback
      setTotal(previousTotal);
    }
  };

  // --- 4. CLEAR CART (Optimistic) ---
  const clear = async () => {
    const previousItems = [...items];
    const previousTotal = total;

    setItems([]);
    setTotal(0);

    try {
      await apiClearCart();
    } catch (error) {
      setItems(previousItems);
      setTotal(previousTotal);
    }
  };

  return (
    <CartContext.Provider value={{ items, total, loading, add, update, remove, clear, reload: load }}>
      {children}
    </CartContext.Provider>
  );
};
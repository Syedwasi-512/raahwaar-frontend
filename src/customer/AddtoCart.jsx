import React, { useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../features/cartContext.jsx";
import toast from "react-hot-toast";

// Memoized cart item component for performance
const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  // Syncing with refactored backend structure
  const getProductId = item.productId;
  const qty = item.quantity;
  const product = item.product;
  const price = item.finalPrice; // Discounted price from backend
  const originalPrice = product?.price || 0;
  const stockLimit = product?.stock || 0;

  const handleQuantityChange = useCallback(
    (newQuantity) => {
      // Logic: strictly between 1 and available stock
      if (newQuantity > 0 && newQuantity <= stockLimit && newQuantity !== qty) {
        onUpdateQuantity(getProductId, newQuantity);

      }
    },
    [getProductId, qty, stockLimit, onUpdateQuantity]
  );

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow duration-200">
      {/* Remove button */}
      <button
        onClick={() => onRemove(getProductId)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <img
            src={product?.image || "/placeholder.png"}
            alt={product?.title}
            className="w-20 h-20 object-cover rounded-md"
            loading="lazy"
          />
          {product?.discountPercent > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate pr-6">
            {product?.title}
          </h3>
          <div className="mt-1 text-xs text-gray-500 space-y-0.5">
            <p>
              Size: {product?.size} || {product?.condition}
            </p>
            {product?.color && <p>Color: {product?.color}</p>}
          </div>

          {/* Price and Quantity */}
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                {product?.discountPercent > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    Rs. {originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900">
                  Rs. {price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-200 rounded-md">
              <button
                onClick={() => handleQuantityChange(qty - 1)}
                className="p-1 hover:bg-gray-100 transition-colors"
                disabled={qty <= 1}
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                {qty}
              </span>
              <button
                onClick={() => handleQuantityChange(qty + 1)}
                className="p-1 hover:bg-gray-100 transition-colors"
                disabled={qty >= stockLimit}
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = "CartItem";

const AddtoCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    items: cartItems = [],
    total: totalAmount, // Using pre-calculated total from Context
    loading,
    update: updateItem,
    remove: removeItem,
  } = useCart();

  // Memoize summary calculations
  const { itemCount, savings } = useMemo(() => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const totalSavings = cartItems.reduce((sum, item) => {
      const original = item.product?.price || 0;
      const final = item.finalPrice || 0;
      return sum + (original - final) * item.quantity;
    }, 0);

    return { itemCount: count, savings: totalSavings };
  }, [cartItems]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Handlers
  const handleUpdateQuantity = useCallback(
    (productId, quantity) => {
      updateItem(productId, quantity).catch((err) => toast.error(err));
    },
    [updateItem]
  );

  const handleRemoveItem = useCallback(
    (productId) => {
      removeItem(productId).catch((err) => toast.error(err));
    },
    [removeItem]
  );

  const handleCheckout = useCallback(() => {
    onClose();
    navigate("/order");
  }, [navigate, onClose]);

  const handleViewCart = useCallback(() => {
    onClose();
    navigate("/viewcart");
  }, [navigate, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] lg:w-[450px] bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-500 mt-0.5">{itemCount} items</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress */}
        {cartItems.length > 0 && totalAmount < 5000 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-800">
                Add Rs.{(5000 - totalAmount).toLocaleString()} for free shipping
              </span>
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((totalAmount / 5000) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(!cartItems || cartItems.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button onClick={onClose} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Continue Shopping →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 space-y-4">
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">You saved</span>
                <span className="text-green-600 font-medium">Rs. {savings.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">Rs. {totalAmount.toLocaleString()}</span>
            </div>

            <p className="text-xs text-gray-500 text-center">Shipping & taxes calculated at checkout</p>

            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <button
                onClick={handleViewCart}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                View Cart Details
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Guaranteed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddtoCart;
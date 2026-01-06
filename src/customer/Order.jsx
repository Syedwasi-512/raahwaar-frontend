import React, { useState, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder } from "../services/api";
import { useCart } from "../features/cartContext";
import {
  CheckCircle2,
  ShoppingBag,
  Truck,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CreditCard,
  Phone,
  Mail,
  User,
  MapPin,
  ChevronRight,
} from "lucide-react";

// --- SUB-COMPONENT: Modern Order Item Card ---
const OrderItemRow = memo(({ item, formatPrice }) => {
  const product = item.product || item.productId;
  // Use finalPrice from backend if available, fallback to price
  const price = item.price;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0 group">
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 bg-white border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
        <img
          src={
            product?.images?.[0]?.url || product?.image || "/placeholder.png"
          }
          alt={product?.title}
          className="h-full w-full object-contain"
        />
        <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-bl-xl shadow-lg">
          {item.quantity}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate leading-tight uppercase tracking-tight">
          {product?.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>{product?.brandId?.name || product?.brand}</span>
          <span>•</span>
          <span>Size: {product?.sizeId?.value || product?.size}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs sm:text-sm font-black text-gray-900">
          {formatPrice(price * item.quantity)}
        </p>
      </div>
    </div>
  );
});

const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, clear: clearCart } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddress: "",
  });
  const [errors, setErrors] = useState({});

  // --- 1. DATA LOGIC (Source of Truth) ---
  const orderItems = useMemo(() => {
    // Priority: "Buy Now" state, then Cart
    if (location.state?.product) {
      const p = location.state.product;
      return [
        {
          productId: p._id,
          product: p,
          quantity: location.state.quantity || 1,
          price: p.finalPrice || p.price || 0,
        },
      ];
    }
    return cartItems.map((item) => ({
      productId: item.productId?._id || item.productId,
      product: item.product || item.productId,
      quantity: item.quantity || 1,
      price: item.finalPrice || item.product?.price || 0,
    }));
  }, [location.state, cartItems]);

  const totals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return { subtotal, shipping: 0, total: subtotal };
  }, [orderItems]);

  const formatPrice = useCallback((price) => {
    return `Rs. ${new Intl.NumberFormat("en-PK", {
      maximumFractionDigits: 0,
    }).format(price)}`;
  }, []);

  // --- 2. HANDLERS ---
  const handleInput = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email required";
    if (!/^(\+92|0)?3[0-9]{9}$/.test(form.phone))
      errs.phone = "Valid 11-digit number required";
    if (form.shippingAddress.trim().length < 15)
      errs.shippingAddress = "Address is too short";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Data aligned with Refactored OrderController
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        shippingAddress: form.shippingAddress.trim(),
        products: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(payload);
      if (response.data.success) {
        setOrderPlaced(true);
        // Clean up cart only if it was a cart order
        if (!location.state?.product) await clearCart();
      }
    } catch (err) {
      console.error("Order Submission Error:", err);
      setErrors({
        submit:
          err.response?.data?.message || "Failed to process order. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. UI STATES ---
  if (orderItems.length === 0 && !orderPlaced) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner text-gray-200">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-gray-400">
          Bag is Empty
        </h2>
        <button
          onClick={() => navigate("/")}
          className="mt-6 text-xs font-black border-b-2 border-black pb-1 uppercase tracking-[0.2em] hover:text-gray-500 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 text-center animate-in zoom-in-95 duration-500 border border-white">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-4 uppercase italic">
            Order Created
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">
            Check your inbox at{" "}
            <span className="text-black font-bold">{form.email}</span>. Click
            the verification link to confirm and process your shipment.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-[#222] transition-all"
          >
            Continue to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans antialiased text-[#1A1A1A]">
      {/* 
          MODERN STICKY HEADER 
          Lower Z-index (30) ensures Cart (usually 50+) overlays it.
      */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100/50 h-16 sm:h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between relative">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-gray-50 rounded-full transition-all group border border-transparent hover:border-gray-100"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 select-none">
            <span className="text-xl sm:text-2xl font-black tracking-[0.4em] uppercase transition-all">
              RAAHWAAR
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:p-8">
        {/* LEFT: INFORMATION FORM */}
        <div className="lg:col-span-7 space-y-6 px-4 sm:px-0">
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
                <div className="h-12 w-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight italic">
                    Delivery Info
                  </h2>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                    Personal Identification
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  icon={User}
                  label="Recipient Name"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleInput}
                  error={errors.name}
                />
                <InputField
                  icon={Mail}
                  label="Email for Verification"
                  name="email"
                  placeholder="name@email.com"
                  value={form.email}
                  onChange={handleInput}
                  error={errors.email}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                   Contact
                </label>
                <div
                  className={`flex items-center bg-gray-50 rounded-2xl border transition-all px-4 ${
                    errors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-100 focus-within:border-black focus-within:bg-white"
                  }`}
                >
                  <Phone size={18} className="text-gray-300 mr-3" />
                  <span className="text-sm font-bold text-gray-400 border-r border-gray-200 pr-3 mr-3">
                    +92
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="3XXXXXXXXX"
                    value={form.phone}
                    onChange={handleInput}
                    className="bg-transparent w-full py-4 text-sm font-bold outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              <InputField
                icon={MapPin}
                label="Shipping Address"
                name="shippingAddress"
                placeholder="Street, House #, landmark, city..."
                value={form.shippingAddress}
                onChange={handleInput}
                error={errors.shippingAddress}
                isTextArea
              />

              <div className="p-6 bg-gray-900 rounded-[1.5rem] text-white flex items-center justify-between group shadow-2xl shadow-black/10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                      Settlement
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Cash on Delivery
                    </p>
                  </div>
                </div>
                <div className="h-6 w-6 rounded-full border-2 border-white/20 flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-[11px] font-black uppercase tracking-tight">
                  <AlertCircle size={20} /> {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-[0.4em] hover:bg-[#222] transition-all shadow-xl shadow-black/10 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Finalizing
                    Order
                  </>
                ) : (
                  <>
                    Place Order <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY (Sticky Sidebar) */}
        <div className="lg:col-span-5 px-4 sm:px-0">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 sticky top-28 overflow-hidden">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-8 pb-4 border-b border-gray-50 flex items-center justify-between italic">
              Order Manifest <ShoppingBag size={14} />
            </h3>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
              {orderItems.map((item, idx) => (
                <OrderItemRow key={idx} item={item} formatPrice={formatPrice} />
              ))}
            </div>

            <div className="mt-10 space-y-4 pt-8 border-t border-gray-100">
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <span>Pre-Total</span>
                <span className="text-gray-900">
                  {formatPrice(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <span>Shipping</span>
                <span className="text-emerald-500 font-black">L-Ship Free</span>
              </div>
              <div className="flex justify-between text-lg font-black text-gray-900 pt-6 border-t-2 border-dashed border-gray-100 uppercase tracking-tighter italic">
                <span>Final Total</span>
                <span className="text-2xl font-black">
                  {formatPrice(totals.total)}
                </span>
              </div>
            </div>

            {/* Verification Note */}
            <p className="mt-8 text-[11px] font-semibold text-red-500 text-center uppercase tracking-widest leading-relaxed">
              Upon clicking purchase, a verification email will be dispatched to
              your account.
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// --- MODERN HELPER COMPONENTS ---
const InputField = ({
  icon: Icon,
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  isTextArea = false,
}) => (
  <div className="space-y-2 group">
    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1 group-focus-within:text-black transition-colors">
      {label}
    </label>
    <div
      className={`flex items-start bg-gray-50 rounded-2xl border transition-all px-4 ${
        error
          ? "border-red-500 bg-red-50"
          : "border-gray-100 focus-within:border-black focus-within:bg-white shadow-sm focus-within:shadow-none"
      }`}
    >
      <Icon className="mt-4 text-gray-400 mr-3 flex-shrink-0" size={18} />
      {isTextArea ? (
        <textarea
          name={name}
          rows="3"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-transparent w-full py-4 text-sm font-bold outline-none resize-none placeholder:text-gray-300"
        />
      ) : (
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-transparent w-full py-4 text-sm font-bold outline-none placeholder:text-gray-300"
        />
      )}
    </div>
    {error && (
      <p className="text-[10px] text-red-500 font-bold uppercase ml-1 tracking-tight">
        {error}
      </p>
    )}
  </div>
);

export default Order;

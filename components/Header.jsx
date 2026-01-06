import React, { useState, useEffect, Suspense, lazy, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setSearchQuery } from "../src/features/productSlice";
import { useCart } from "../src/features/cartContext";
import logo from "../src/assets/Raahwaar_1.png";
import {
  FaBars,
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaTimes,
  FaHome,
  FaMale,
  FaFemale,
  FaChild,
  FaVenusMars,
} from "react-icons/fa";

const AddtoCart = lazy(() => import("../src/customer/AddtoCart"));

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const IconButton = memo(({ icon: Icon, onClick, badge, className = "" }) => (
  <button
    onClick={onClick}
    className={`relative p-2 text-[#1a1a1a] hover:bg-gray-50 rounded-full transition-colors duration-200 ${className}`}
  >
    <Icon size={19} />
    {badge > 0 && (
      <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
        {badge}
      </span>
    )}
  </button>
));

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { searchQuery } = useSelector((state) => state.products);
  const { items: cartItems = [] } = useCart();
  const cartCount = cartItems.reduce(
    (sum, it) => sum + (it.qty ?? it.quantity ?? 1),
    0
  );

  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const debouncedSearchTerm = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearchTerm !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchTerm));
      if (debouncedSearchTerm.trim() !== "" && location.pathname !== "/") {
        navigate("/");
      }
    }
  }, [debouncedSearchTerm, dispatch]);

  useEffect(() => {
    if (searchQuery === "") setLocalSearch("");
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) setShowHeader(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 100)
        setShowHeader(false);
      else setShowHeader(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || isSearchOpen ? "hidden" : "";
  }, [isMobileMenuOpen, isSearchOpen]);

  const handleResetHome = () => {
    setLocalSearch("");
    dispatch(setSearchQuery(""));
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleCategoryClick = (gender) => {
    setIsMobileMenuOpen(false);
    setLocalSearch("");
    dispatch(setSearchQuery(""));
    navigate(`/?gender=${gender.toLowerCase()}`);
  };

  return (
    <>
      <header
        className={`bg-[#eeeeee] backdrop-blur-md border-b border-[#f0f0f0] w-full z-50 transition-all duration-300 ease-in-out h-16 sm:h-[68px] flex items-center ${
          !showHeader ? "-translate-y-full" : "translate-y-0"
        } ${lastScrollY > 20 ? "fixed top-0 left-0 right-0" : "relative"}`}
      >
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT: Burger & Brand */}
            <div className="flex items-center gap-2 sm:gap-6">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#1a1a1a]"
                aria-label="Toggle Menu"
              >
                <FaBars size={20} />
              </button>

<div
  onClick={handleResetHome}
  className="cursor-pointer flex items-center select-none"
>
  <div
    onClick={() => navigate("/")}
    className="flex items-center leading-none group cursor-pointer select-none transition-all duration-300 active:scale-95"
  >
    
    {/* Speed Lines - Horse Running Effect */}
    <div className="relative flex flex-col gap-[2px] mr-1 opacity-0 group-hover:opacity-70 transition-all duration-500">
      <div className="w-3 h-[1.5px] bg-gradient-to-r from-transparent to-[#1A1A1A] rounded-full"></div>
      <div className="w-5 h-[2px] bg-gradient-to-r from-transparent to-[#1A1A1A] rounded-full"></div>
      <div className="w-4 h-[1.5px] bg-gradient-to-r from-transparent to-[#1A1A1A] rounded-full"></div>
      <div className="w-6 h-[2px] bg-gradient-to-r from-transparent to-[#1A1A1A] rounded-full"></div>
      <div className="w-3 h-[1.5px] bg-gradient-to-r from-transparent to-[#1A1A1A] rounded-full"></div>
    </div>

    {/* Logo Icon - Horse R */}
    <div className="relative h-7 sm:h-10 lg:h-11 flex items-center justify-center overflow-hidden">
      <img
        src={"./try3.png"}
        alt="logo"
        className="h-full w-auto object-contain transition-transform duration-700 ease-out group-hover:rotate-[-5deg] group-hover:scale-110"
        onError={(e) => (e.target.style.display = "none")}
      />
    </div>

    {/* Brand Text - AAHWAAR with Thunder Effect */}
    <div className="flex flex-col justify-center">
      <span 
        className="text-xl sm:text-2xl lg:text-3xl font-serif tracking-tighter uppercase leading-[0.8] font-bold bg-clip-text text-transparent transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Crect fill='%231A1A1A' width='100' height='50'/%3E%3Cpath d='M15,0 L10,20 L20,24 L5,50' stroke='%23ffffff' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3Cpath d='M40,0 L48,18 L38,22 L50,50' stroke='%23e0e0e0' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3Cpath d='M65,0 L58,22 L70,26 L55,50' stroke='%23ffffff' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3Cpath d='M88,0 L95,16 L85,20 L98,50' stroke='%23d0d0d0' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: '50px 25px'
        }}
      >
        AAHWAAR
      </span>
    </div>

    {/* Wind Trail Effect */}
    <div className="hidden sm:flex flex-col gap-[2px] ml-1 opacity-0 group-hover:opacity-40 transition-all duration-500">
      <div className="w-2 h-[1px] bg-gradient-to-l from-transparent to-[#1A1A1A] rounded-full"></div>
      <div className="w-3 h-[1.5px] bg-gradient-to-l from-transparent to-[#1A1A1A] rounded-full"></div>
      <div className="w-2 h-[1px] bg-gradient-to-l from-transparent to-[#1A1A1A] rounded-full"></div>
    </div>

    {/* TM */}
    <sup className="hidden sm:block text-[8px] font-bold text-gray-400 ml-[2px] mt-[-10px]">
      TM
    </sup>
    
  </div>
</div>

              {/* Desktop Categories: text-[12px] with tracking is professional */}
              <nav className="hidden lg:flex items-center gap-6 ml-4">
                {["Men", "Women", "Kids", "Unisex"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="text-[12px] font-bold text-[#4a4a4a] hover:text-black transition-colors uppercase tracking-[0.12em] border-b-2 border-transparent hover:border-black py-1"
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>

            {/* CENTER: Compact Search Bar: text-[13px] for perfect readability */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search footwear..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-[#f6f6f6] border-none text-[#1a1a1a] text-[13px] rounded-md py-2.5 pl-10 pr-4 outline-none focus:ring-1 focus:ring-black transition-all"
                />
                <FaSearch
                  className="absolute left-3.5 top-3 pointer-events-none text-gray-400 group-focus-within:text-black transition-colors"
                  size={13}
                />
              </div>
            </div>

            {/* RIGHT: Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <IconButton
                icon={FaSearch}
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden"
              />
              <IconButton
                icon={FaUser}
                onClick={() => navigate("/login")}
                className="hidden sm:flex"
              />
              <IconButton
                icon={FaShoppingBag}
                onClick={() => setIsCartOpen(true)}
                badge={cartCount}
              />
            </div>
          </div>
        </div>
      </header>

      {lastScrollY > 20 && <div className="h-16 sm:h-[68px]" />}

      {/* MOBILE SEARCH OVERLAY: text-[14px] for mobile typing ease */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center p-4 border-b border-gray-100 gap-3">
            <div className="relative flex-1">
              <input
                autoFocus
                type="text"
                placeholder="What are you looking for?"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-[#f6f6f6] border-none rounded-md py-3 pl-10 pr-4 text-[14px] focus:ring-0"
              />
              <FaSearch
                className="absolute left-3.5 top-4 text-gray-400"
                size={15}
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-[12px] font-bold uppercase tracking-wider px-2 text-[#4a4a4a]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MOBILE MENU: text-[14px] (text-sm) for standard mobile navigation */}
      <div
        className={`fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 w-[80%] max-w-[320px] h-full bg-white shadow-2xl transition-transform duration-500 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <span className="text-[13px] font-black tracking-widest uppercase">
              Menu
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-gray-50 rounded-full"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="flex flex-col p-4 space-y-1">
            <button
              onClick={handleResetHome}
              className="flex items-center gap-4 w-full p-3.5 rounded-lg hover:bg-gray-50 text-[14px] font-bold uppercase tracking-widest"
            >
              <FaHome size={17} /> Home
            </button>
            <div className="h-px bg-gray-50 my-2" />
            <button
              onClick={() => handleCategoryClick("men")}
              className="flex items-center gap-4 w-full p-3.5 rounded-lg hover:bg-gray-50 text-[14px] font-bold uppercase tracking-widest"
            >
              <FaMale size={17} /> Men
            </button>
            <button
              onClick={() => handleCategoryClick("women")}
              className="flex items-center gap-4 w-full p-3.5 rounded-lg hover:bg-gray-50 text-[14px] font-bold uppercase tracking-widest"
            >
              <FaFemale size={17} /> Women
            </button>
            <button
              onClick={() => handleCategoryClick("kids")}
              className="flex items-center gap-4 w-full p-3.5 rounded-lg hover:bg-gray-50 text-[14px] font-bold uppercase tracking-widest"
            >
              <FaChild size={17} /> Kids
            </button>
            <button
              onClick={() => handleCategoryClick("unisex")}
              className="flex items-center gap-4 w-full p-3.5 rounded-lg hover:bg-gray-50 text-[14px] font-bold uppercase tracking-widest"
            >
              <FaVenusMars size={17} /> Unisex
            </button>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <AddtoCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </Suspense>
    </>
  );
};

export default memo(Header);

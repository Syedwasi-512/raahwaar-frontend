import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../features/productSlice";
import { useCart } from "../features/cartContext";
import SEO from "../../components/SEO";
import { 
  ChevronRight, Minus, Plus, ShoppingBag, Zap, 
  ShieldCheck, Truck, Check, ChevronDown, ChevronUp, X 
} from "lucide-react";

// --- SUB-COMPONENT: Shopify-style Circular Lens Magnifier ---
const ProductLensMagnifier = memo(({ src, alt }) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const lensSize = 180; 
  const zoomLevel = 2.2;

  return (
    <div
      className="relative aspect-square w-full overflow-hidden bg-[#F9F9F9] rounded-sm border border-gray-100 cursor-none"
      onMouseEnter={(e) => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
      }}
      onMouseMove={(e) => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();
        const x = e.pageX - left - window.scrollX;
        const y = e.pageY - top - window.scrollY;
        setXY([x, y]);
      }}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain" />
      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            height: `${lensSize}px`,
            width: `${lensSize}px`,
            borderRadius: "50%",
            border: "1px solid #ddd",
            boxShadow: "0 0 10px rgba(0,0,0,0.15)",
            backgroundColor: "white",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            zIndex: 10,
            top: `${y - lensSize / 2}px`,
            left: `${x - lensSize / 2}px`,
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
            backgroundPosition: `${-x * zoomLevel + lensSize / 2}px ${-y * zoomLevel + lensSize / 2}px`,
          }}
        />
      )}
    </div>
  );
});

// --- SUB-COMPONENT: Related/Recent Product Card (Refined Details) ---
const ProductSmallCard = memo(({ product, formatPrice }) => {
  const navigate = useNavigate();
  // Using pre-calculated finalPrice from backend
  const finalPrice = product.finalPrice || (product.discountPercent > 0 ? product.price - (product.price * product.discountPercent) / 100 : product.price);

  return (
    <div
      onClick={() => { navigate(`/productDetail/${product._id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      className="flex-shrink-0 w-[180px] sm:w-[240px] group cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#F5F5F5] mb-2 border border-gray-100">
        <img src={product.images?.[0]?.url || "/placeholder.png"} alt={product.title} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        
        {/* Discount Badge Logic */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            -{product.discountPercent}%
          </div>
        )}
      </div>
      <div className="space-y-0.5 px-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{product.brandId?.name || "Premium"}</p>
        <h4 className="text-[13px] font-medium text-gray-800 truncate group-hover:underline">{product.title}</h4>
        
        {/* Card Metadata: Size & Condition for better UX */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
            <span className="text-gray-900 bg-gray-100 px-1 rounded">SZ {product.sizeId?.value || 'N/A'}</span>
            <span className="text-emerald-600">{product.conditionId?.name}</span>
        </div>

        <p className="text-sm font-bold text-gray-900 pt-0.5">{formatPrice(finalPrice)}</p>
      </div>
    </div>
  );
});

const ProductDetailPage = () => {
  const { id } = useParams();
  const { add } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector((state) => state.products);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  // States for Vertical Accordions
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isSpecOpen, setIsSpecOpen] = useState(false);

  useEffect(() => { if (products.length === 0) dispatch(fetchProducts()); }, [dispatch, products.length]);
  const product = useMemo(() => products.find((item) => item._id === id), [products, id]);
  
  useEffect(() => { if (product?.images?.length > 0) setSelectedImage(product.images[0].url); }, [product]);

  // --- RECENTLY VIEWED LOGIC ---
  useEffect(() => {
    if (product) {
      const items = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Filter out current and limit to 10 for performance
      const filtered = items.filter(i => i._id !== product._id);
      const updated = [product, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [product]);

  const recentItems = useMemo(() => {
    const data = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    return data.filter(item => item._id !== id);
  }, [id]);

  const stockLimit = product?.quantity || 0;
  const incrementQty = useCallback(() => setQuantity((prev) => Math.min(stockLimit, prev + 1)), [stockLimit]);
  const decrementQty = useCallback(() => setQuantity((prev) => Math.max(1, prev - 1)), []);

  const formatPrice = useCallback((price) => {
    return `Rs.${new Intl.NumberFormat("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price || 0)}`;
  }, []);

  // --- REFACTORED: Advanced Related Logic (Matches Brand, Type, Gender, Condition) ---
  const relatedProducts = useMemo(() => {
    if (!product || !products.length) return [];
    return products.filter((p) => {
      if (p._id === id) return false;
      const mBrand = p.brandId?._id === product.brandId?._id;
      const mType = (p.typeId?._id || p.shoeTypeId?._id) === (product.typeId?._id || product.shoeTypeId?._id);
      const mGender = p.genderId?._id === product.genderId?._id;
      return mBrand || mType || mGender;
    }).slice(0, 8);
  }, [products, product, id]);

  if (loading || !product) return <div className="h-screen bg-white flex items-center justify-center"><div className="w-6 h-6 border-2 border-t-black rounded-full animate-spin" /></div>;

  const finalPrice = product.finalPrice || (product.discountPercent > 0 ? product.price - (product.price * product.discountPercent) / 100 : product.price);

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white font-sans antialiased text-[#1a1a1a]">
      <SEO title={product.brandId.name}
          description={`${product.title}} - Condition: ${product.conditionId?.name}. Buy premium footwear at Raahwaar.`}
          image={product.images?.[0]?.url}
          url={window.location.href}
      />
      
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-3 sm:py-5">
        
        <nav className="flex items-center space-x-1 text-[13px] font-medium text-gray-400 mb-5 sm:mb-7 uppercase tracking-wider">
          <button onClick={() => navigate("/")} className="hover:text-black transition-colors">Home</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-semibold">{product.brandId?.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-16 items-start">
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3">
            <div className="flex md:flex-col gap-6 overflow-x-auto md:w-16 lg:w-20 no-scrollbar">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(img.url)} className={`relative flex-shrink-0 aspect-square w-14 md:w-full rounded-sm overflow-hidden border transition-all ${selectedImage === img.url ? "border-black shadow-sm" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <img src={img.url} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="flex-1">
              <ProductLensMagnifier src={selectedImage || product.images[0]?.url} alt={product.title} />
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24 mt-8 lg:mt-0">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-[12px] font-bold text-blue-600 uppercase tracking-widest">{product.brandId?.name}</span>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 leading-tight uppercase">{product.title}</h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl lg:text-3xl font-black text-gray-900">{formatPrice(finalPrice)}</span>
                {product.discountPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-400 line-through">{formatPrice(product.price)}</span>
                    <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-100">-{product.discountPercent}%</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Size</p><p className="text-[14px] font-bold text-gray-800 uppercase">{product.sizeId?.value}</p></div>
                <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Condition</p><p className="text-[14px] font-bold text-gray-800 uppercase">{product.conditionId?.name}</p></div>
              </div>

              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Color</p><p className="text-[14px] font-bold text-gray-800 uppercase" >{product.colorId?.name}</p></div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center border border-gray-200 w-28 h-9 rounded-md bg-gray-50/50">
                  <button onClick={decrementQty} disabled={quantity <= 1} className="flex-1 h-full flex items-center justify-center hover:bg-white transition text-lg"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button onClick={incrementQty} disabled={quantity >= stockLimit} className="flex-1 h-full flex items-center justify-center hover:bg-white transition text-lg"><Plus size={14} /></button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button onClick={async () => { try { await add(product, quantity); setIsAdded(true); setTimeout(() => setIsAdded(false), 2000); } catch(e){ alert(e.message) } }} disabled={!product.inStock || stockLimit === 0} className={`h-11 rounded-md text-[13px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${isAdded ? "bg-green-600 text-white" : "bg-white text-black border border-black hover:bg-black hover:text-white"} disabled:opacity-30`}>
                    {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />} {isAdded ? "Added" : "Add to Cart"}
                  </button>
                  <button onClick={() => navigate("/order", { state: { product, quantity } })} disabled={!product.inStock || stockLimit === 0} className="h-11 bg-black text-white rounded-md text-[13px] font-bold uppercase tracking-widest hover:bg-[#333] transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-sm">
                    <Zap size={14} className="fill-current" /> Buy It Now
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${stockLimit > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  <span className={`text-[13px] font-bold uppercase tracking-wider ${stockLimit > 0 ? "text-green-600" : "text-red-600"}`}>
                    {stockLimit > 0 ? `In Stock (${stockLimit} available)` : "Out of Stock"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                  <Truck size={14} /><span>Free delivery over Rs. 5,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- VERTICAL ACCORDIONS (Design Refactored for Readability) --- */}
        <div className="mt-16 pt-8 border-t border-gray-100 w-full">
          
          {/* 1. Description Accordion */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between py-5 text-left group" onClick={() => setIsDescOpen(!isDescOpen)}>
              <span className="text-[13px] font-black uppercase tracking-[0.2em] group-hover:text-black">Description</span>
              {isDescOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isDescOpen && (
              <div className="pb-8 space-y-10 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest">Product Detail</h3>
                  <p className="text-[15px] leading-relaxed text-gray-700 font-medium whitespace-pre-line">{product.description}</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Condition Guide</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 max-w-2xl">
                    <table className="w-full text-left border-collapse text-[14px]">
                      <tbody className="divide-y divide-gray-200">
                        <tr><td className="p-3 font-bold text-[10px] text-gray-400 uppercase w-28">Premium</td><td className="p-3">Like new condition. Zero signs of wear.</td></tr>
                        <tr><td className="p-3 font-bold text-[10px] text-gray-400 uppercase w-28">Excellent</td><td className="p-3">Nearly new with almost no visible wear.</td></tr>
                        <tr><td className="p-3 font-bold text-[10px] text-gray-400 uppercase w-28">Very Good</td><td className="p-3">Minor signs of use but very well maintained.</td></tr>
                        <tr><td className="p-3 font-bold text-[10px] text-gray-400 uppercase w-28">Good</td><td className="p-3">Visible wear but structurally perfect and clean.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Specifications Accordion */}
          <div className="border-b border-gray-100">
            <button className="w-full flex items-center justify-between py-5 text-left group" onClick={() => setIsSpecOpen(!isSpecOpen)}>
              <span className="text-[13px] font-black uppercase tracking-[0.2em] group-hover:text-black">Specifications</span>
              {isSpecOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isSpecOpen && (
              <div className="pb-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 animate-in slide-in-from-top-2">
                {[
                  { label: "Category", value: product.typeId?.name },
                  { label: "Condition", value: product.conditionId?.name },
                  { label: "Gender", value: product.genderId?.name },
                  { label: "Size", value: product.sizeId?.value },
                  { label: "Color", value: product.colorId?.name },
                  { label: "Authenticity", value: "Verified Original" },
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-400 uppercase text-[11px] font-bold">{spec.label}</span>
                    <span className="text-gray-900 font-bold text-[14px]">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-center mb-10 text-gray-400">You May Also Like</h2>
            <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-8 no-scrollbar scroll-smooth snap-x">
              {relatedProducts.map((p) => (
                <div key={p._id} className="snap-start"><ProductSmallCard product={p} formatPrice={formatPrice} /></div>
              ))}
            </div>
          </div>
        )}

        {/* RECENTLY VIEWED (NEW SECTION) */}
        {recentItems.length > 0 && (
          <div className="mt-20">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-center mb-10 text-gray-400 italic">Recently Viewed</h2>
            <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-8 no-scrollbar scroll-smooth snap-x">
              {recentItems.map((p) => (
                <div key={p._id} className="snap-start"><ProductSmallCard product={p} formatPrice={formatPrice} /></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
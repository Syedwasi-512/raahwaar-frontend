import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setSearchQuery } from "../features/productSlice";
import { getFilters } from "../features/filterService";
import { optimizeImage } from "../features/imageEngine";
import {
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Search,
} from "lucide-react";

// --- CUSTOM HOOK: useDebounce for Performance ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- SUB-COMPONENTS (Memoized for Performance) ---

const ProductCardItem = memo(({ product, onClick, formatPrice }) => {
  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  // Syncing with Backend finalPrice
  const displayPrice = product.finalPrice || product.price;

  return (
    <div
      className="group cursor-pointer flex flex-col h-full bg-white"
      onClick={() => onClick(product._id)}
    >
      <div className="relative aspect-square overflow-hidden bg-[#F9F9F9] rounded-lg mb-3">
        <img
          src={optimizeImage(product.images?.[0]?.url, 600) || "/placeholder.png"}
          alt={product.title}
          loading="lazy"
          className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[12px] font-bold px-1.5 py-0.5 rounded-full w-10 h-10 flex items-center justify-center tracking-wide">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
              NEW
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 px-1 gap-1">
        <h3 className="text-[16px] font-medium text-gray-700 leading-tight line-clamp-2 group-hover:underline underline-offset-4 decoration-gray-400">
          {product.title}
        </h3>
        <div className="flex items-center pt-1 gap-1 text-xs text-gray-500">
          <label htmlFor="Size" className="font-medium text-[13px] lg:text-[15px]">Size:</label>
          <span className="rounded text-gray-600 font-normal text-[13px] lg:text-[15px]">
            {product.sizeId?.value}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <label htmlFor="Condition" className="font-semibold text-[13px] lg:text-[15px]">Condition:</label>
          <span className="rounded text-gray-600 font-normal text-[13px] lg:text-[15px]">
            {product.conditionId?.name}
          </span>
        </div>
        


        <div className="mt-auto flex items-center gap-2">
          <span className="text-base font-normal text-red-600 lg:text-[17px]">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

const FilterSection = memo(({ title, children, isOpen, onToggle }) => (
  <div className="border-b border-gray-100 py-4">
    <button
      className="flex items-center justify-between w-full text-left mb-2 group"
      onClick={onToggle}
    >
      <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
        {title}
      </span>
      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {isOpen && <div className="mt-2 space-y-1">{children}</div>}
  </div>
));

const FilterSidebar = memo(
  ({
    filters,
    filterOptions,
    openSections,
    onToggleSection,
    onCheckboxChange,
    onInputChange,
    onClearAll,
  }) => (
    <div className="space-y-1 pb-20 lg:pb-0">
      <button
        onClick={onClearAll}
        className="w-full text-left text-sm font-medium text-red-600 hover:text-red-800 py-2"
      >
        Clear Filters
      </button>

      <FilterSection
        title="Price Range"
        isOpen={openSections.price}
        onToggle={() => onToggleSection("price")}
      >
        <div className="flex gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={onInputChange}
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={onInputChange}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </FilterSection>

      <FilterSection
        title="Size"
        isOpen={openSections.size}
        onToggle={() => onToggleSection("size")}
      >
        <div className="grid grid-cols-4 gap-2">
          {filterOptions.sizes.map((s) => (
            <button
              key={s._id}
              onClick={() => onCheckboxChange("sizeId", s._id)}
              className={`text-xs py-2 rounded border cursor-pointer transition-all ${
                filters.sizeId.includes(s._id)
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 hover:border-x-black hover:opacity-75"
              }`}
            >
              {s.value}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Condition"
        isOpen={openSections.condition}
        onToggle={() => onToggleSection("condition")}
      >
        <div className="max-h-24 space-y-2">
          {filterOptions.conditions.map((c) => (
            <label
              key={c._id}
              className="flex items-center gap-2 cursor-pointer hover:opacity-75"
            >
              <input
                type="checkbox"
                checked={filters.conditionId.includes(c._id)}
                onChange={() => onCheckboxChange("conditionId", c._id)}
                className="rounded border-gray-300 text-black"
              />
              <span className="text-sm text-gray-700">{c.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Brand"
        isOpen={openSections.brand}
        onToggle={() => onToggleSection("brand")}
      >
        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
          {filterOptions.brands.map((b) => (
            <label
              key={b._id}
              className="flex items-center gap-2 cursor-pointer hover:opacity-75"
            >
              <input
                type="checkbox"
                checked={filters.brandId.includes(b._id)}
                onChange={() => onCheckboxChange("brandId", b._id)}
                className="rounded border-gray-300 text-black"
              />
              <span className="text-sm text-gray-700">{b.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Shoe Type"
        isOpen={openSections.type}
        onToggle={() => onToggleSection("type")}
      >
        {filterOptions.shoetypes.map((t) => (
          <label
            key={t._id}
            className="flex items-center gap-2 cursor-pointer py-1 hover:opacity-75"
          >
            <input
              type="checkbox"
              checked={filters.typeId.includes(t._id)}
              onChange={() => onCheckboxChange("typeId", t._id)}
              className="rounded border-gray-300 text-black"
            />
            <span className="text-sm text-gray-700">{t.name}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection
        title="Color"
        isOpen={openSections.color}
        onToggle={() => onToggleSection("color")}
      >
        <div className="flex flex-wrap gap-2">
          {filterOptions.colors.map((c) => (
            <button
              key={c._id}
              onClick={() => onCheckboxChange("colorId", c._id)}
              title={c.name}
              className={`w-8 h-8 rounded-full border shadow-sm flex items-center justify-center cursor-pointer transition-transform ${
                filters.colorId.includes(c._id)
                  ? "ring-2 ring-offset-2 ring-black scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: c.code || c.name.toLowerCase() }}
            >
              {filters.colorId.includes(c._id) && (
                <span className="text-xs bg-white/50 rounded-full px-1">✓</span>
              )}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )
);

// --- MAIN PAGE COMPONENT ---
const ProductCardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, searchQuery } = useSelector((state) => state.products);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openSections, setOpenSections] = useState({
    brand: true,
    price: true,
    size: true,
    gender: true,
    type: true,
    color: true,
    condition: true,
  });

  const [filterOptions, setFilterOptions] = useState({
    genders: [],
    brands: [],
    conditions: [],
    sizes: [],
    colors: [],
    shoetypes: [],
  });
  const [filters, setFilters] = useState({
    brandId: [],
    genderId: [],
    sizeId: [],
    typeId: [],
    colorId: [],
    conditionId: [],
    minPrice: "",
    maxPrice: "",
  });

  // Debounced values for performance
  const debouncedMin = useDebounce(filters.minPrice, 500);
  const debouncedMax = useDebounce(filters.maxPrice, 500);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        await dispatch(fetchProducts());
        const res = await getFilters();
        const data = res.data || res;
        setFilterOptions({
          genders: data.genders || [],
          shoetypes: data.shoeTypes || [],
          brands: data.brands || [],
          conditions: data.conditions || [],
          sizes: data.sizes || [],
          colors: data.colors || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [dispatch]);

  // Sync URL params
  useEffect(() => {
    const urlGender = searchParams.get("gender");
    if (filterOptions.genders.length > 0) {
      const matched = filterOptions.genders.find(
        (g) => g.name.toLowerCase() === urlGender?.toLowerCase()
      );
      setFilters((prev) => ({
        ...prev,
        genderId: matched ? [matched._id] : [],
      }));
    }
    setCurrentPage(1);
  }, [searchParams.get("gender"), filterOptions.genders]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.title?.toLowerCase().includes(q) ||
          p.brandId?.name?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.brandId.length && !filters.brandId.includes(p.brandId?._id))
        return false;
      if (
        filters.genderId.length &&
        !filters.genderId.includes(p.genderId?._id)
      )
        return false;
      if (filters.sizeId.length && !filters.sizeId.includes(p.sizeId?._id))
        return false;
      if (filters.typeId.length && !filters.typeId.includes(p.typeId?._id))
        return false;
      if (filters.colorId.length && !filters.colorId.includes(p.colorId?._id))
        return false;
      if (
        filters.conditionId.length &&
        !filters.conditionId.includes(p.conditionId?._id)
      )
        return false;

      const price = p.finalPrice || p.price;
      if (debouncedMin && price < Number(debouncedMin)) return false;
      if (debouncedMax && price > Number(debouncedMax)) return false;
      return true;
    });
  }, [products, filters, searchQuery, debouncedMin, debouncedMax]);

  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * 24, currentPage * 24),
    [filteredProducts, currentPage]
  );
  const totalPages = Math.ceil(filteredProducts.length / 24);

  const formatPrice = useCallback(
    (price) =>
      `Rs.${new Intl.NumberFormat("en-PK", { minimumFractionDigits: 0 }).format(
        price || 0
      )}`,
    []
  );
  const handleCheckboxChange = useCallback((key, id) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((x) => x !== id)
        : [...prev[key], id],
    }));
  }, []);
  const handleInputChange = useCallback((e) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  const toggleSection = useCallback(
    (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] })),
    []
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      brandId: [],
      genderId: [],
      sizeId: [],
      typeId: [],
      colorId: [],
      conditionId: [],
      minPrice: "",
      maxPrice: "",
    });
    dispatch(setSearchQuery(""));
    navigate("/?");
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:hidden sticky top-[56px] z-20 bg-white/95 backdrop-blur-sm border-b px-4 py-3 flex justify-between items-center shadow-sm">
        <span className="text-xs font-medium text-gray-500">
          {filteredProducts.length} Results
        </span>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold uppercase border px-3 py-1.5 rounded"
        >
          <SlidersHorizontal size={14} /> FILTER
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-hide">
            <h2 className="text-lg font-semibold mb-6">FILTER</h2>
            <FilterSidebar
              {...{
                filters,
                filterOptions,
                openSections,
                onToggleSection: toggleSection,
                onCheckboxChange: handleCheckboxChange,
                onInputChange: handleInputChange,
                onClearAll: clearAllFilters,
              }}
            />
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <div className="text-center py-20">Loading...</div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8">
                  {paginatedProducts.map((p) => (
                    <ProductCardItem
                      key={p._id}
                      product={p}
                      onClick={(id) => navigate(`/productDetail/${id}`)}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center gap-4">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-4 py-2 border rounded disabled:opacity-50 transition"
                    >
                      Prev
                    </button>
                    <span className="py-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-4 py-2 border rounded disabled:opacity-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-gray-50 rounded">
                <Search size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold">No products found</h3>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 border-b-2 border-black font-bold text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col p-4 animate-in slide-in-from-right">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <FilterSidebar
                {...{
                  filters,
                  filterOptions,
                  openSections,
                  onToggleSection: toggleSection,
                  onCheckboxChange: handleCheckboxChange,
                  onInputChange: handleInputChange,
                  onClearAll: clearAllFilters,
                }}
              />
            </div>
            <div className="pt-4 border-t">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-black text-white py-3 rounded font-bold"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCardPage;

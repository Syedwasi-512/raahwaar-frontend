import React, { useEffect, useState } from "react";
import { createProduct, getAllProducts, updateProduct } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { getFilters } from "../features/filterService";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  Layers,
  Tag,
  DollarSign,
  Package,
  Image as ImageIcon,
} from "lucide-react";

const AddProduct = ({ mode = "add" }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- 1. Global State ---
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- 2. Options State ---
  const [options, setOptions] = useState({
    genders: [],
    brands: [],
    conditions: [],
    sizes: [],
    colors: [],
    shoeTypes: [],
  });

  // --- 3. Form Data State ---
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    quantity: 1,
    discountPercent: 0,
    featured: false,
    brandId: "",
    genderId: "",
    sizeId: "",
    colorId: "",
    conditionId: "",
    shoeTypeId: "",
  });

  // --- 4. Image Management ---
  const [newImages, setNewImages] = useState([]); // Fresh files
  const [previews, setPreviews] = useState([]); // Blob URLs
  const [existingImages, setExistingImages] = useState([]); // DB images
  const [removedImages, setRemovedImages] = useState([]); // Public IDs to delete

  // --- 5. Data Initialization ---
  useEffect(() => {
    const initData = async () => {
      try {
        const filterRes = await getFilters();
        const fData = filterRes.data || filterRes;

        setOptions({
          genders: fData.genders || [],
          brands: fData.brands || [],
          conditions: fData.conditions || [],
          sizes: fData.sizes || [],
          colors: fData.colors || [],
          shoeTypes: fData.shoeTypes || [],
        });

        if (mode === "edit" && id) {
          const productRes = await getAllProducts();
          const p = productRes.data.find((item) => item._id === id);

          if (p) {
            setForm({
              title: p.title || "",
              description: p.description || "",
              price: p.price || "",
              quantity: p.quantity || 1,
              discountPercent: p.discountPercent || 0,
              featured: p.featured || false,
              brandId: p.brandId?._id || p.brandId || "",
              genderId: p.genderId?._id || p.genderId || "",
              sizeId: p.sizeId?._id || p.sizeId || "",
              colorId: p.colorId?._id || p.colorId || "",
              conditionId: p.conditionId?._id || p.conditionId || "",
              shoeTypeId: p.typeId?._id || p.shoeTypeId?._id || "",
            });
            setExistingImages(p.images || []);
          }
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [mode, id]);

  // --- 6. Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (img) => {
    setExistingImages((prev) =>
      prev.filter((i) => i.public_id !== img.public_id)
    );
    setRemovedImages((prev) => [...prev, img.public_id]); // Flag for backend
  };

  // --- 7. Validation ---
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.price || form.price <= 0) errs.price = "Valid price required";
    if (mode === "add" && newImages.length === 0)
      errs.images = "At least one image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- 8. Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      // Append Fields
      Object.keys(form).forEach((key) => {
        if (key === "shoeTypeId") {
          formData.append("typeId", form[key]); // Map correctly for backend
        } else {
          formData.append(key, form[key]);
        }
      });

      // Handle Image Updates
      if (removedImages.length > 0) {
        formData.append("removedImages", JSON.stringify(removedImages));
      }
      newImages.forEach((file) => formData.append("images", file));

      if (mode === "edit") {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }

      navigate("/products");
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const finalPrice = form.price
    ? (form.price - (form.price * form.discountPercent) / 100).toFixed(0)
    : 0;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-gray-400 w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-gray-900">
      {/* Sticky Header - Design preserved exactly */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">
              {mode === "edit" ? "Edit Product" : "Add Product"}
            </h1>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {mode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-xl shadow-[0_2px_5px_-1px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                General Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all placeholder-gray-400`}
                    placeholder="e.g. Nike Air Jordan 1 Low"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    value={form.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-y placeholder-gray-400`}
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-[0_2px_5px_-1px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                Media
              </h2>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                  errors.images
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to upload images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {(previews.length > 0 || existingImages.length > 0) && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 mt-6">
                  {existingImages.map((img, i) => (
                    <div
                      key={`exist-${i}`}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {previews.map((url, i) => (
                    <div
                      key={`new-${i}`}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-black/5 group shadow-sm"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-[0_2px_5px_-1px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers size={18} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Product Attributes
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Brand"
                  name="brandId"
                  value={form.brandId}
                  options={options.brands}
                  onChange={handleChange}
                  error={errors.brandId}
                />
                <SelectField
                  label="Shoe Type"
                  name="shoeTypeId"
                  value={form.shoeTypeId}
                  options={options.shoeTypes}
                  onChange={handleChange}
                  error={errors.shoeTypeId}
                />
                <SelectField
                  label="Gender"
                  name="genderId"
                  value={form.genderId}
                  options={options.genders}
                  onChange={handleChange}
                />
                <SelectField
                  label="Size"
                  name="sizeId"
                  value={form.sizeId}
                  options={options.sizes}
                  onChange={handleChange}
                  isSize
                />
                <SelectField
                  label="Color"
                  name="colorId"
                  value={form.colorId}
                  options={options.colors}
                  onChange={handleChange}
                />
                <SelectField
                  label="Condition"
                  name="conditionId"
                  value={form.conditionId}
                  options={options.conditions}
                  onChange={handleChange}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-[0_2px_5px_-1px_rgba(0,0,0,0.1)] border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                Status
              </h2>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Featured Product
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={18} className="text-gray-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Pricing
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.price ? "border-red-500" : "border-gray-200"
                    } focus:ring-1 focus:ring-black outline-none`}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={form.discountPercent}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Final Price
                  </span>
                  <span className="font-bold text-lg text-emerald-600 font-mono">
                    Rs. {finalPrice}
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} className="text-gray-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Inventory
                </h2>
              </div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-black outline-none"
              />
              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-tighter">
                {form.quantity > 0 ? (
                  <CheckCircle size={14} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={14} className="text-red-500" />
                )}
                <span
                  className={
                    form.quantity > 0 ? "text-emerald-600" : "text-red-600"
                  }
                >
                  {form.quantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  isSize,
}) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tight">
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-lg border ${
          error ? "border-red-500" : "border-gray-200"
        } bg-white appearance-none focus:ring-1 focus:ring-black outline-none cursor-pointer text-sm transition-all`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt._id} value={opt._id}>
            {isSize ? opt.value : opt.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
        <ChevronDown size={14} />
      </div>
    </div>
    {error && (
      <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-tighter">
        {error}
      </p>
    )}
  </div>
);

export default AddProduct;

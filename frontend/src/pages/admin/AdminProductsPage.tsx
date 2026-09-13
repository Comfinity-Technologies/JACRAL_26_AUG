import { useEffect, useState, useRef } from "react";
import { apiClient } from "../../api/client";
import {
  Plus,
  ImagePlus,
  Images,
  X,
  Check,
  Loader2,
  Trash2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getImageUrl } from "../../utils/image";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  is_active: boolean;
  category_id: number | null;
  image_url?: string | null;
  hover_image_url?: string | null;
}

type ImageSlot = "primary" | "hover";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Product Form State
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });

  // Manage Multiple Images Modal for existing products
  const [imageModalProduct, setImageModalProduct] = useState<Product | null>(null);
  const [isUploadingSlot, setIsUploadingSlot] = useState<ImageSlot | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const hoverFileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        apiClient.get("/api/v1/admin/products?limit=50"),
        apiClient.get("/api/v1/admin/categories"),
      ]);
      setProducts(prodRes.data.items);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
    });
    setPrimaryImageFile(null);
    setHoverImageFile(null);
    setPrimaryPreview(null);
    setHoverPreview(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const validateImage = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Please upload a JPG, PNG, WebP, or GIF image.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be smaller than 5 MB.");
      return false;
    }
    return true;
  };

  const handleImageChange = (file: File | undefined, slot: ImageSlot) => {
    if (!file || !validateImage(file)) return;
    const preview = URL.createObjectURL(file);
    if (slot === "primary") {
      if (primaryPreview) URL.revokeObjectURL(primaryPreview);
      setPrimaryImageFile(file);
      setPrimaryPreview(preview);
    } else {
      if (hoverPreview) URL.revokeObjectURL(hoverPreview);
      setHoverImageFile(file);
      setHoverPreview(preview);
    }
  };

  const removeImage = (slot: ImageSlot) => {
    if (slot === "primary") {
      if (primaryPreview) URL.revokeObjectURL(primaryPreview);
      setPrimaryImageFile(null);
      setPrimaryPreview(null);
    } else {
      if (hoverPreview) URL.revokeObjectURL(hoverPreview);
      setHoverImageFile(null);
      setHoverPreview(null);
    }
  };

  const uploadProductImage = async (productId: number, file: File, slot: ImageSlot) => {
    const data = new FormData();
    data.append("file", file);
    const res = await apiClient.post(
      `/api/v1/admin/products/${productId}/image?slot=${slot}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.stock) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.post("/api/v1/admin/products", {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: formData.category_id ? Number(formData.category_id) : null,
      });

      const productId = response.data.id;

      if (primaryImageFile) {
        await uploadProductImage(productId, primaryImageFile, "primary");
      }
      if (hoverImageFile) {
        await uploadProductImage(productId, hoverImageFile, "hover");
      }

      closeForm();
      await fetchData();
    } catch (error: any) {
      console.error("Failed to create product:", error);
      alert(error?.response?.data?.detail || "Failed to create product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/api/v1/admin/products/${productId}/status`, {
        is_active: !currentStatus,
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  // Direct image upload from the Images Modal
  const handleModalImageUpload = async (slot: ImageSlot, file: File) => {
    if (!imageModalProduct || !validateImage(file)) return;
    setIsUploadingSlot(slot);
    try {
      const updatedProduct = await uploadProductImage(imageModalProduct.id, file, slot);
      setImageModalProduct(updatedProduct);
      setUploadSuccessMsg(`Updated ${slot === "primary" ? "Main" : "Hover"} Image!`);
      setTimeout(() => setUploadSuccessMsg(null), 3000);
      await fetchData();
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      alert(err?.response?.data?.detail || "Image upload failed");
    } finally {
      setIsUploadingSlot(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2C221E] uppercase tracking-tight">
            Products & Inventory
          </h1>
          <p className="text-sm font-medium text-[#685B55] mt-1">
            Manage your jackfruit cereal catalog, primary images, and hover images.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#3B6E4C] hover:bg-[#285642] text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showForm ? "Cancel" : "Add Product"}</span>
        </button>
      </div>

      {/* ── CREATE PRODUCT FORM (WITH MULTI-IMAGE SETUP) ── */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border-2 border-[#E5DCDB] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#E5DCDB] pb-4">
            <h2 className="text-xl font-black text-[#2C221E] uppercase tracking-tight">
              Create New Product
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-2 text-[#685B55] hover:text-[#2C221E] rounded-full hover:bg-[#FAF6EE]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#2C221E] mb-1.5">
                  Product Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jackfruit Millet Cereal – Strawberry Citrus"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DCDB] focus:border-[#3B6E4C] outline-none text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#2C221E] mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299.00"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5DCDB] focus:border-[#3B6E4C] outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#2C221E] mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5DCDB] focus:border-[#3B6E4C] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#2C221E] mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DCDB] focus:border-[#3B6E4C] outline-none text-sm font-medium bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#2C221E] mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bullet notes or description: 20% Protein, 25% Fiber, Zero Added Sugar..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DCDB] focus:border-[#3B6E4C] outline-none text-sm font-medium resize-none"
                />
              </div>
            </div>

            {/* MULTIPLE IMAGE UPLOAD SLOTS */}
            <div className="space-y-4">
              <span className="block text-xs font-black uppercase tracking-wider text-[#2C221E]">
                Product Images (Multiple Setup)
              </span>

              {/* Slot 1: Primary Image */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#3B6E4C]/30 bg-[#FAF6EE]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-[#3B6E4C] tracking-wider flex items-center gap-1.5">
                    <ImagePlus size={16} /> 1. Main / Primary Image
                  </span>
                  {primaryPreview && (
                    <button
                      type="button"
                      onClick={() => removeImage("primary")}
                      className="text-red-600 text-xs font-bold hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {primaryPreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-white border border-[#E5DCDB] max-h-36 flex items-center justify-center">
                    <img src={primaryPreview} alt="Preview" className="h-full object-contain" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 bg-white border border-[#E5DCDB] rounded-xl cursor-pointer hover:border-[#3B6E4C] transition-all">
                    <ImagePlus size={24} className="text-[#3B6E4C] mb-1" />
                    <span className="text-xs font-bold text-[#2C221E]">Upload Main Image</span>
                    <span className="text-[10px] text-[#685B55]">JPG, PNG, WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files?.[0], "primary")}
                    />
                  </label>
                )}
              </div>

              {/* Slot 2: Hover Image */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-[#E88D36]/30 bg-[#FFF9F0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-[#E88D36] tracking-wider flex items-center gap-1.5">
                    <Images size={16} /> 2. Secondary / Hover Image
                  </span>
                  {hoverPreview && (
                    <button
                      type="button"
                      onClick={() => removeImage("hover")}
                      className="text-red-600 text-xs font-bold hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {hoverPreview ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-white border border-[#E5DCDB] max-h-36 flex items-center justify-center">
                    <img src={hoverPreview} alt="Preview" className="h-full object-contain" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 bg-white border border-[#E5DCDB] rounded-xl cursor-pointer hover:border-[#E88D36] transition-all">
                    <Images size={24} className="text-[#E88D36] mb-1" />
                    <span className="text-xs font-bold text-[#2C221E]">Upload Hover Image</span>
                    <span className="text-[10px] text-[#685B55]">Shown when customer hovers</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files?.[0], "hover")}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCDB]">
            <button
              type="button"
              onClick={closeForm}
              className="px-6 py-2.5 rounded-xl border border-[#E5DCDB] text-sm font-bold text-[#685B55] hover:bg-[#FAF6EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 rounded-xl bg-[#3B6E4C] hover:bg-[#285642] text-white font-bold text-sm shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              <span>{isSaving ? "Saving Product..." : "Save Product"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── PRODUCTS TABLE ── */}
      <div className="bg-white border border-[#E5DCDB] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-[#FAF6EE] text-xs font-black uppercase tracking-wider text-[#685B55] border-b border-[#E5DCDB]">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6">Images Setup</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB] text-sm font-medium text-[#2C221E]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] border border-[#E5DCDB] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.image_url ? (
                          <img
                            src={getImageUrl(p.image_url)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-black text-[#E88D36]">J</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#2C221E] line-clamp-1">{p.name}</p>
                        <p className="text-xs text-[#685B55]">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-[#3B6E4C]">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-6 font-semibold">{p.stock}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          p.image_url ? "bg-[#3B6E4C]/10 text-[#3B6E4C]" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        Main: {p.image_url ? "✓" : "–"}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          p.hover_image_url
                            ? "bg-[#E88D36]/10 text-[#E88D36]"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        Hover: {p.hover_image_url ? "✓" : "–"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                        p.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageModalProduct(p)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#FAF0DE] border border-[#E5DCDB] text-xs font-black uppercase tracking-wider text-[#2C221E] flex items-center gap-1.5 transition-colors"
                      >
                        <Images size={14} className="text-[#E88D36]" />
                        <span>Manage Images</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id, p.is_active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          p.is_active
                            ? "text-[#E88D36] hover:bg-[#E88D36]/10"
                            : "text-[#3B6E4C] hover:bg-[#3B6E4C]/10"
                        }`}
                      >
                        {p.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#685B55]">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: MANAGE MULTIPLE IMAGES FOR SELECTED PRODUCT ── */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#E5DCDB] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#2C221E] uppercase tracking-tight">
                  Manage Product Images
                </h3>
                <p className="text-xs font-bold text-[#E88D36] mt-0.5">
                  {imageModalProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImageModalProduct(null)}
                className="p-2 text-[#685B55] hover:text-[#2C221E] rounded-full hover:bg-[#FAF6EE]"
              >
                <X size={20} />
              </button>
            </div>

            {uploadSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Slot */}
              <div className="p-5 rounded-2xl border-2 border-[#3B6E4C]/20 bg-[#FAF6EE] flex flex-col items-center text-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#3B6E4C] mb-3 flex items-center gap-1.5">
                  <ImagePlus size={16} /> Primary / Main Image
                </span>
                <div className="w-full aspect-square bg-white rounded-xl border border-[#E5DCDB] overflow-hidden mb-4 flex items-center justify-center">
                  {imageModalProduct.image_url ? (
                    <img
                      src={getImageUrl(imageModalProduct.image_url)}
                      alt="Primary"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-bold">No primary image set</span>
                  )}
                </div>
                <input
                  ref={primaryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleModalImageUpload("primary", file);
                  }}
                />
                <button
                  type="button"
                  disabled={isUploadingSlot === "primary"}
                  onClick={() => primaryFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#3B6E4C] hover:bg-[#285642] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isUploadingSlot === "primary" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={14} />
                      <span>{imageModalProduct.image_url ? "Replace Main Image" : "Upload Main Image"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Hover Slot */}
              <div className="p-5 rounded-2xl border-2 border-[#E88D36]/20 bg-[#FFF9F0] flex flex-col items-center text-center">
                <span className="text-xs font-black uppercase tracking-wider text-[#E88D36] mb-3 flex items-center gap-1.5">
                  <Images size={16} /> Secondary / Hover Image
                </span>
                <div className="w-full aspect-square bg-white rounded-xl border border-[#E5DCDB] overflow-hidden mb-4 flex items-center justify-center">
                  {imageModalProduct.hover_image_url ? (
                    <img
                      src={getImageUrl(imageModalProduct.hover_image_url)}
                      alt="Hover"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-bold">No hover image set</span>
                  )}
                </div>
                <input
                  ref={hoverFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleModalImageUpload("hover", file);
                  }}
                />
                <button
                  type="button"
                  disabled={isUploadingSlot === "hover"}
                  onClick={() => hoverFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E88D36] hover:bg-[#D47E2A] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isUploadingSlot === "hover" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Images size={14} />
                      <span>{imageModalProduct.hover_image_url ? "Replace Hover Image" : "Upload Hover Image"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setImageModalProduct(null)}
                className="px-6 py-2.5 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { Plus, ShoppingBag, Edit3, X, Check, UploadCloud } from "lucide-react";

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
  image_url?: string;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get("/api/v1/admin/products?limit=50"),
        apiClient.get("/api/v1/admin/categories"),
      ]);
      setProducts(prodRes.data.items);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setImageFile(null);
    setFormData({ name: "", description: "", price: "", stock: "", category_id: "" });
  };

  const handleStartCreate = () => {
    setEditingProduct(null);
    setImageFile(null);
    setFormData({ name: "", description: "", price: "", stock: "", category_id: "" });
    setShowForm(true);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id ? product.category_id.toString() : "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let productId = editingProduct?.id;

      if (editingProduct) {
        // UPDATE existing product
        await apiClient.patch(`/api/v1/admin/products/${editingProduct.id}`, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        });
      } else {
        // CREATE new product
        const res = await apiClient.post("/api/v1/admin/products", {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        });
        productId = res.data.id;
      }

      // Upload image if a new image file was selected
      if (imageFile && productId) {
        const fileData = new FormData();
        fileData.append("file", imageFile);
        await apiClient.post(`/api/v1/admin/products/${productId}/image`, fileData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save product");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/api/v1/admin/products/${id}/status`, { is_active: !currentStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-3xl"></div>
      </div>
    );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <div className="bg-[#3B6E4C]/10 p-2 rounded-xl text-[#3B6E4C]">
              <ShoppingBag size={24} />
            </div>
            Products
          </h1>
          <p className="text-[#685B55]">Manage your product catalog, pricing, and inventory.</p>
        </div>
        <button
          onClick={handleStartCreate}
          className="flex items-center space-x-2 bg-[#E88D36] text-[#2C221E] px-6 py-3 rounded-full font-bold hover:bg-[#D47E2A] hover:text-white transition-colors shadow-lg shadow-[#E88D36]/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-[24px] shadow-md border-2 border-[#E88D36]/30 space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#E5DCDB] pb-4">
            <h2 className="text-xl font-bold text-[#2C221E]" style={{ fontFamily: "var(--font-heading)" }}>
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "New Product Details"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="p-2 text-[#685B55] hover:text-red-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                Name
              </label>
              <input
                required
                type="text"
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors text-[#2C221E]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Premium Jackfruit Slices"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                Category
              </label>
              <select
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors bg-white cursor-pointer text-[#2C221E]"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                Price (₹)
              </label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors text-[#2C221E]"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                Stock Level
              </label>
              <input
                required
                type="number"
                className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors text-[#2C221E]"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2">
              Description
            </label>
            <textarea
              required
              className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors resize-none text-[#2C221E]"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the product..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-[#2C221E] mb-2 flex items-center gap-2">
              <UploadCloud size={18} className="text-[#E88D36]" /> Product Image {editingProduct ? "(Upload new to replace)" : "(Optional)"}
            </label>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              className="w-full border-2 border-[#E5DCDB] rounded-xl px-4 py-3 outline-none focus:border-[#3B6E4C] transition-colors bg-white text-[#2C221E]"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5DCDB]">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-xl font-bold text-[#685B55] hover:bg-[#FAF6EE] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#3B6E4C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#285642] transition-colors shadow-lg shadow-[#3B6E4C]/20 flex items-center gap-2"
            >
              <Check size={18} />
              <span>{editingProduct ? "Update Product" : "Save Product"}</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[24px] shadow-sm border border-[#E5DCDB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-[#FAF6EE] text-[#685B55] text-left text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-[24px]">Product Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-[24px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCDB]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FCFAF4] transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-[#2C221E]">{p.name}</div>
                    <div className="text-xs text-[#685B55] mt-0.5">{p.slug}</div>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#3B6E4C]">
                    ₹{p.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-5 font-medium text-[#2C221E]">{p.stock}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        p.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#E5DCDB] text-[#685B55]"
                      }`}
                    >
                      {p.is_active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="font-bold text-xs px-3.5 py-2 rounded-lg bg-[#FAF6EE] text-[#2C221E] hover:bg-[#3B6E4C] hover:text-white transition-all inline-flex items-center gap-1.5 border border-[#E5DCDB]"
                      title="Edit Product"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    {/* TOGGLE STATUS BUTTON */}
                    <button
                      onClick={() => handleToggleStatus(p.id, p.is_active)}
                      className={`font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors border ${
                        p.is_active
                          ? "text-[#E88D36] border-[#E88D36]/30 hover:bg-[#E88D36]/10"
                          : "text-[#3B6E4C] border-[#3B6E4C]/30 hover:bg-[#3B6E4C]/10"
                      }`}
                    >
                      {p.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#685B55] font-medium">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;

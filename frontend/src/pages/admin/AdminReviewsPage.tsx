import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface ReviewItem {
  id: number;
  customer_name: string;
  customer_location?: string | null;
  review_text: string;
  rating: number;
  is_active: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_location: "",
    review_text: "",
    rating: 5,
    is_published: true,
    is_active: true,
    display_order: 1,
  });

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get<ReviewItem[]>("/api/v1/admin/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openCreateModal = () => {
    setEditingReview(null);
    setFormData({
      customer_name: "",
      customer_location: "",
      review_text: "",
      rating: 5,
      is_published: true,
      is_active: true,
      display_order: reviews.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (review: ReviewItem) => {
    setEditingReview(review);
    setFormData({
      customer_name: review.customer_name,
      customer_location: review.customer_location || "",
      review_text: review.review_text,
      rating: review.rating,
      is_published: review.is_published,
      is_active: review.is_active,
      display_order: review.display_order,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await apiClient.put(`/api/v1/admin/reviews/${editingReview.id}`, formData);
      } else {
        await apiClient.post("/api/v1/admin/reviews", formData);
      }
      setShowModal(false);
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save review");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;
    try {
      await apiClient.delete(`/api/v1/admin/reviews/${id}`);
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete review");
    }
  };

  const handleTogglePublish = async (review: ReviewItem) => {
    try {
      const endpoint = review.is_published
        ? `/api/v1/admin/reviews/${review.id}/unpublish`
        : `/api/v1/admin/reviews/${review.id}/publish`;
      await apiClient.post(endpoint);
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to toggle review status");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full" />
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2C221E] mb-2 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <MessageSquare size={24} />
            </div>
            Customer Reviews
          </h1>
          <p className="text-[#685B55]">
            Manage, publish, and add customer reviews displayed on the website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3B6E4C] hover:bg-[#2C5238] text-white rounded-full font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Add Review
        </button>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E5DCDB]">
          <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-lg font-bold text-[#2C221E]">No reviews yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Click "Add Review" above to create your first customer testimonial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-[#E5DCDB] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Header: Stars & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleTogglePublish(rev)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      rev.is_published
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Click to toggle publish"
                  >
                    {rev.is_published ? "Published" : "Draft"}
                  </button>
                </div>

                {/* Review Text */}
                <p className="text-[#2C221E] text-sm leading-relaxed mb-4 italic">
                  "{rev.review_text}"
                </p>

                {/* Author Info */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-bold text-[#2C221E] text-sm">
                    {rev.customer_name}
                  </p>
                  {rev.customer_location && (
                    <p className="text-xs text-gray-500">
                      {rev.customer_location}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(rev)}
                  className="p-2 text-gray-500 hover:text-[#3B6E4C] hover:bg-gray-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-bold text-[#2C221E] mb-5">
              {editingReview ? "Edit Review" : "Add New Customer Review"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#685B55] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6E4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#685B55] mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={formData.customer_location}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_location: e.target.value })
                  }
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6E4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#685B55] mb-1">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={
                          star <= formData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold ml-2 text-gray-700">
                    {formData.rating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#685B55] mb-1">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.review_text}
                  onChange={(e) =>
                    setFormData({ ...formData, review_text: e.target.value })
                  }
                  placeholder="What did the customer say about Jacral Oats..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3B6E4C]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData({ ...formData, is_published: e.target.checked })
                    }
                    className="rounded text-[#3B6E4C] focus:ring-[#3B6E4C] h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-[#2C221E]">
                    Publish on website immediately
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full text-gray-600 hover:bg-gray-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3B6E4C] hover:bg-[#2C5238] text-white rounded-full font-bold shadow-sm transition-all"
                >
                  {editingReview ? "Save Changes" : "Create Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

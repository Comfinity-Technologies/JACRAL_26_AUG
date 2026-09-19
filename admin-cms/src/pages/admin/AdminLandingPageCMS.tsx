import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  Send,
  Trash2,
  Sparkles,
  Layers,
  FileText,
  ExternalLink,
  RefreshCw,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import {
  getAdminLandingPage,
  uploadBrandLogo,
  removeBrandLogo,
  updateBrandDraft,
  updateSlide,
  uploadSlideImage,
  updateSectionDraft,
  publishLandingPage,
  adminGetHowToUseSteps,
  adminCreateHowToUseStep,
  adminUpdateHowToUseStep,
  adminDeleteHowToUseStep,
  adminUploadHowToUseStepImage,
  uploadNaturalGoodnessImage,
} from "../../services/landingPageService";
import type { HowToUseStepAdmin } from "../../services/landingPageService";
import { getImageUrl } from "../../utils/image";
import type {
  AdminLandingPageData,
  HeroSlideAdmin,
  BrandAdminInfo,
} from "../../types/landingPage";


import AdminReviewsPage from "./AdminReviewsPage";

export default function AdminLandingPageCMS() {
  const [data, setData] = useState<AdminLandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Editable local state
  const [brandDraft, setBrandDraft] = useState<{ brand_name: string; tagline: string }>({
    brand_name: "JACRAL",
    tagline: "",
  });
  const [slidesDraft, setSlidesDraft] = useState<HeroSlideAdmin[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Natural Goodness section state ──
  const [naturalGoodnessDraft, setNaturalGoodnessDraft] = useState<{
    title: string;
    subtitle: string;
  }>({ title: "", subtitle: "" });
  const [ngImage, setNgImage] = useState<string | null>(null);
  const [ngUploading, setNgUploading] = useState(false);

  // ── How To Use state ──
  const [howToUseSteps, setHowToUseSteps] = useState<HowToUseStepAdmin[]>([]);
  const [howToUseLoading, setHowToUseLoading] = useState(false);
  const [editingStep, setEditingStep] = useState<HowToUseStepAdmin | null>(null);
  const [newStepForm, setNewStepForm] = useState<{
    step_number: string;
    title: string;
    description: string;
  }>({ step_number: "", title: "", description: "" });
  const [showNewStepForm, setShowNewStepForm] = useState(false);
  const [uploadingStepId, setUploadingStepId] = useState<number | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);


  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAdminLandingPage();
      setData(res);
      setBrandDraft({
        brand_name: res.brand.brand_name || "JACRAL",
        tagline: res.brand.tagline || "",
      });
      setSlidesDraft(res.hero_slides || []);

      const ngSection = res.sections?.["natural_goodness"];
      setNaturalGoodnessDraft({
        title: ngSection?.title || "",
        subtitle: ngSection?.subtitle || "",
      });
      setNgImage(res.brand?.natural_goodness_image_url || null);
    } catch (err: any) {
      console.error("Failed to load CMS data:", err);
      showToast("Failed to load CMS content", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadHowToUseSteps = async () => {
    try {
      setHowToUseLoading(true);
      const steps = await adminGetHowToUseSteps();
      setHowToUseSteps(steps);
    } catch (err) {
      console.error("Failed to load How To Use steps:", err);
    } finally {
      setHowToUseLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadHowToUseSteps();
  }, []);

  // ── How To Use Handlers ──
  const handleCreateStep = async () => {
    const stepNum = parseInt(newStepForm.step_number);
    if (!newStepForm.title.trim() || isNaN(stepNum)) {
      showToast("Step number and title are required.", "error");
      return;
    }
    try {
      setSaving(true);
      await adminCreateHowToUseStep({
        step_number: stepNum,
        title: newStepForm.title.trim(),
        description: newStepForm.description.trim(),
        sort_order: stepNum,
        is_active: true,
      });
      showToast("Step created successfully.");
      setNewStepForm({ step_number: "", title: "", description: "" });
      setShowNewStepForm(false);
      await loadHowToUseSteps();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to create step", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStep = async () => {
    if (!editingStep) return;
    try {
      setSaving(true);
      await adminUpdateHowToUseStep(editingStep.id, {
        title: editingStep.title,
        description: editingStep.description,
        step_number: editingStep.step_number,
        sort_order: editingStep.sort_order,
        is_active: editingStep.is_active,
      });
      showToast("Step updated successfully.");
      setEditingStep(null);
      await loadHowToUseSteps();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to update step", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!window.confirm("Delete this step? This cannot be undone.")) return;
    try {
      setSaving(true);
      await adminDeleteHowToUseStep(stepId);
      showToast("Step deleted.");
      await loadHowToUseSteps();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Failed to delete step", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStepImageUpload = async (stepId: number, file: File) => {
    try {
      setUploadingStepId(stepId);
      await adminUploadHowToUseStepImage(stepId, file);
      showToast("Step image uploaded successfully.");
      await loadHowToUseSteps();
    } catch (err: any) {
      showToast(err?.response?.data?.detail || "Image upload failed", "error");
    } finally {
      setUploadingStepId(null);
    }
  };



  // Handle Logo Upload
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const res = await uploadBrandLogo(file);
      showToast("Logo uploaded as draft. Click Publish to make live.");
      await loadData();
    } catch (err: any) {
      console.error("Logo upload error:", err);
      showToast(err?.response?.data?.detail || "Logo upload failed", "error");
    } finally {
      setSaving(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Handle Logo Remove
  const handleRemoveLogo = async () => {
    if (!window.confirm("Remove current logo draft?")) return;
    try {
      setSaving(true);
      await removeBrandLogo();
      showToast("Logo draft removed");
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast("Failed to remove logo", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Slide Text Change in Draft
  const handleSlideChange = (index: number, field: keyof HeroSlideAdmin, value: any) => {
    setSlidesDraft((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Handle Slide Image Upload
  const handleSlideImageUpload = async (
    slideId: number,
    file: File,
    target: "desktop" | "mobile" = "desktop"
  ) => {
    try {
      setSaving(true);
      await uploadSlideImage(slideId, file, target);
      showToast(`Slide ${target} image uploaded as draft. Click Publish to make live.`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.detail || "Image upload failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true);

      // 1. Save brand draft
      await updateBrandDraft(brandDraft);

      // 2. Save slides drafts
      for (const s of slidesDraft) {
        await updateSlide(s.id, {
          draft_title: s.draft_title,
          draft_subtitle: s.draft_subtitle,
          draft_description: s.draft_description,
          draft_cta_text: s.draft_cta_text,
          draft_cta_url: s.draft_cta_url,
          draft_secondary_cta_text: s.draft_secondary_cta_text,
          draft_secondary_cta_url: s.draft_secondary_cta_url,
          draft_is_active: s.draft_is_active,
          display_order: s.display_order,
        });
      }

      // 3. Save Natural Goodness heading/tagline
      await updateSectionDraft("natural_goodness", {
        title: naturalGoodnessDraft.title || null,
        subtitle: naturalGoodnessDraft.subtitle || null,
      });

      showToast("All drafts saved successfully. Click Publish to make them live.");
      await loadData();
    } catch (err: any) {
      console.error("Save draft error:", err);
      showToast("Failed to save drafts", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle Natural Goodness image upload — publishes immediately, same as the logo
  const handleNaturalGoodnessImageUpload = async (file: File) => {
    try {
      setNgUploading(true);
      const res = await uploadNaturalGoodnessImage(file);
      setNgImage(res.image_url);
      showToast("Natural Goodness image updated — it's live now.");
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.detail || "Image upload failed", "error");
    } finally {
      setNgUploading(false);
    }
  };

  // Handle Publish Live
  const handlePublishLive = async () => {
    if (!window.confirm("Publish all pending draft changes live to the customer website?")) {
      return;
    }

    try {
      setPublishing(true);
      // Ensure local edits are saved first
      await handleSaveDraft();
      const res = await publishLandingPage();
      showToast(res.message || "Landing page published live successfully!");
      await loadData();
    } catch (err: any) {
      console.error("Publish error:", err);
      showToast("Failed to publish landing page", "error");
    } finally {
      setPublishing(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"landing" | "reviews">("landing");

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-[#685B55]">
          <RefreshCw className="animate-spin text-[#E88D36]" size={20} />
          <span className="font-semibold text-sm">Loading Landing Page CMS...</span>
        </div>
      </div>
    );
  }

  const brand = data?.brand;
  const activeLogoUrl = brand?.draft_logo_url || brand?.logo_url;
  const hasPending = data?.has_unpublished_changes;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 pb-20">

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider animate-slideDown ${toast.type === "success"
              ? "bg-[#3B6E4C] text-white"
              : "bg-[#D93333] text-white"
            }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── HEADER & WORKFLOW ACTION BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5DCDB]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3B6E4C]">
            <span>Website Content</span>
            <span>/</span>
            <span>{activeTab === "landing" ? "Landing Page" : "Customer Reviews"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-[#2C221E] mt-1">
            {activeTab === "landing" ? "LANDING PAGE CMS" : "CUSTOMER REVIEWS"}
          </h1>
          {activeTab === "landing" && (
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${hasPending
                    ? "bg-[#FFB800]/20 text-[#B38300]"
                    : "bg-[#3B6E4C]/15 text-[#3B6E4C]"
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${hasPending ? "bg-[#FFB800]" : "bg-[#3B6E4C]"}`} />
                {hasPending ? "Draft Changes Pending" : "All Changes Published Live"}
              </span>
              <span className="text-xs text-[#685B55]">
                Edits save as draft. Customer website renders published content.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {activeTab === "landing" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2C221E]/20 bg-white text-[#2C221E] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF6EE] transition-all shadow-sm"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3B6E4C]/30 bg-[#3B6E4C]/10 text-[#3B6E4C] text-xs font-bold uppercase tracking-wider hover:bg-[#3B6E4C]/20 transition-all"
            >
              <Eye size={15} />
              <span>Preview Live</span>
              <ExternalLink size={12} />
            </a>

            <button
              type="button"
              onClick={handlePublishLive}
              disabled={publishing || saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E88D36] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#E88D36]/25 hover:bg-[#D47E2A] hover:scale-[1.02] transition-all"
            >
              <Send size={15} />
              <span>{publishing ? "Publishing..." : "PUBLISH LIVE"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center gap-4 border-b border-[#E5DCDB]">
        <button
          type="button"
          onClick={() => setActiveTab("landing")}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "landing"
              ? "border-[#3B6E4C] text-[#3B6E4C]"
              : "border-transparent text-[#685B55] hover:text-[#2C221E] hover:border-[#E5DCDB]"
          }`}
        >
          Landing Page
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "reviews"
              ? "border-[#3B6E4C] text-[#3B6E4C]"
              : "border-transparent text-[#685B55] hover:text-[#2C221E] hover:border-[#E5DCDB]"
          }`}
        >
          Customer Reviews
        </button>
      </div>

      {activeTab === "landing" ? (
        <>

      {/* ── SECTION 1: BRAND LOGO & SETTINGS ── */}
      <div className="rounded-3xl bg-white border border-[#E5DCDB] p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B6E4C]/10 text-[#3B6E4C] flex items-center justify-center font-black">
              1
            </div>
            <h2 className="text-lg font-black uppercase text-[#2C221E] tracking-tight">
              BRAND LOGO & IDENTITY
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#685B55] uppercase tracking-wider">
            Controls Customer Navbar & Favicon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
          {/* Logo Preview & File Upload */}
          <div className="md:col-span-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">
              Current Logo
            </p>
            <div className="w-full h-32 rounded-2xl border-2 border-dashed border-[#E5DCDB] bg-[#FAF6EE] flex items-center justify-center p-4 relative overflow-hidden group">
              {activeLogoUrl ? (
                <img
                  src={getImageUrl(activeLogoUrl)}
                  alt="Brand Logo"
                  className="max-h-full max-w-full object-contain filter drop-shadow"
                />
              ) : (
                <div className="text-center text-[#685B55] space-y-1">
                  <ImageIcon size={24} className="mx-auto text-[#E88D36]" />
                  <p className="text-xs font-bold uppercase tracking-wider">No Logo Uploaded</p>
                  <p className="text-[10px]">Navbar renders text mark</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
                id="logo-upload-input"
              />
              <label
                htmlFor="logo-upload-input"
                className="flex-1 text-center py-2 px-4 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3D302B] cursor-pointer shadow-sm transition"
              >
                Upload New Logo
              </label>

              {activeLogoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-2 text-[#D93333] hover:bg-red-50 rounded-xl border border-red-200"
                  title="Remove logo"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#685B55]">
              Formats: PNG, JPG, WebP, SVG. Max 5 MB.
            </p>
          </div>

          {/* Brand Name & Tagline */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={brandDraft.brand_name}
                onChange={(e) => setBrandDraft({ ...brandDraft, brand_name: e.target.value })}
                placeholder="e.g. JACRAL"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DCDB] text-sm font-semibold text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={brandDraft.tagline}
                onChange={(e) => setBrandDraft({ ...brandDraft, tagline: e.target.value })}
                placeholder="e.g. Pure Jackfruit Goodness · 100% Natural"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DCDB] text-sm font-medium text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: THREE HERO SLIDES (HAND-DRAWN SKETCH SPEC) ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E88D36]/10 text-[#E88D36] flex items-center justify-center font-black">
              2
            </div>
            <h2 className="text-lg font-black uppercase text-[#2C221E] tracking-tight">
              HERO SLIDER (3 SLIDES)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#685B55] uppercase tracking-wider">
            Controlled Directly From Admin Panel
          </span>
        </div>

        <div className="space-y-6">
          {slidesDraft.map((slide, index) => {
            const slideImg = slide.draft_image_url || slide.image_url;
            return (
              <div
                key={slide.id || index}
                className="rounded-3xl bg-white border border-[#E5DCDB] p-6 md:p-8 shadow-sm space-y-6"
              >
                {/* Slide Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#FAF6EE]">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#2C221E] text-[#FFB800] text-xs font-black uppercase rounded-lg tracking-wider">
                      Slide 0{slide.slide_number || index + 1}
                    </span>
                    <span className="text-sm font-bold uppercase text-[#2C221E]">
                      {slide.draft_title || slide.title || "Untitled Slide"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#2C221E]">
                      <input
                        type="checkbox"
                        checked={slide.draft_is_active}
                        onChange={(e) =>
                          handleSlideChange(index, "draft_is_active", e.target.checked)
                        }
                        className="w-4 h-4 rounded text-[#3B6E4C] focus:ring-[#3B6E4C]"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left: Image Upload & Preview */}
                  <div className="lg:col-span-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">
                      Slide Image
                    </p>
                    <div className="w-full h-44 rounded-2xl border-2 border-dashed border-[#E5DCDB] bg-[#FAF6EE] flex items-center justify-center p-3 relative overflow-hidden">
                      {slideImg ? (
                        <img
                          src={getImageUrl(slideImg)}
                          alt={`Slide ${index + 1}`}
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                      ) : (
                        <div className="text-center text-[#685B55] space-y-1">
                          <ImageIcon size={24} className="mx-auto text-[#E88D36]" />
                          <p className="text-xs font-bold uppercase">No Image Uploaded</p>
                          <p className="text-[10px]">Renders brand medallion</p>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      id={`slide-img-${slide.id}`}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSlideImageUpload(slide.id, f, "desktop");
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor={`slide-img-${slide.id}`}
                      className="w-full block text-center py-2 px-4 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3D302B] cursor-pointer shadow-sm transition"
                    >
                      Upload Slide Image
                    </label>
                  </div>

                  {/* Right: Typography & Content Fields */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                        Title (Headline)
                      </label>
                      <input
                        type="text"
                        value={slide.draft_title || ""}
                        onChange={(e) => handleSlideChange(index, "draft_title", e.target.value)}
                        placeholder="e.g. THE JACKFRUIT REVOLUTION"
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-sm font-bold text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                        Subtitle (Tag)
                      </label>
                      <input
                        type="text"
                        value={slide.draft_subtitle || ""}
                        onChange={(e) => handleSlideChange(index, "draft_subtitle", e.target.value)}
                        placeholder="e.g. 100% UNRIPE BULBS & SEEDS"
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-xs font-semibold text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={slide.display_order || index + 1}
                        onChange={(e) =>
                          handleSlideChange(index, "display_order", parseInt(e.target.value) || 1)
                        }
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-xs font-semibold text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={slide.draft_description || ""}
                        onChange={(e) =>
                          handleSlideChange(index, "draft_description", e.target.value)
                        }
                        placeholder="Nutritional description..."
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-xs font-medium text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                        Primary CTA Text
                      </label>
                      <input
                        type="text"
                        value={slide.draft_cta_text || ""}
                        onChange={(e) => handleSlideChange(index, "draft_cta_text", e.target.value)}
                        placeholder="e.g. SHOP CEREAL"
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-xs font-semibold text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                        Primary CTA Link
                      </label>
                      <input
                        type="text"
                        value={slide.draft_cta_url || ""}
                        onChange={(e) => handleSlideChange(index, "draft_cta_url", e.target.value)}
                        placeholder="/shop"
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-xs font-medium text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: HOW TO USE ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B6E4C]/10 text-[#3B6E4C] flex items-center justify-center font-black">
              3
            </div>
            <h2 className="text-lg font-black uppercase text-[#2C221E] tracking-tight">
              HOW TO USE SECTION
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowNewStepForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3D302B] transition"
          >
            <Plus size={14} />
            Add Step
          </button>
        </div>

        {/* New step form */}
        {showNewStepForm && (
          <div className="rounded-3xl bg-white border border-[#E5DCDB] p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                  Step Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newStepForm.step_number}
                  onChange={(e) => setNewStepForm({ ...newStepForm, step_number: e.target.value })}
                  placeholder="1"
                  className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-sm focus:outline-none focus:border-[#E88D36]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newStepForm.title}
                  onChange={(e) => setNewStepForm({ ...newStepForm, title: e.target.value })}
                  placeholder="e.g. POUR CEREAL"
                  className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-sm focus:outline-none focus:border-[#E88D36]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newStepForm.description}
                  onChange={(e) => setNewStepForm({ ...newStepForm, description: e.target.value })}
                  placeholder="Add 40–50g of Jacral Jackfruit Cereal into your breakfast bowl."
                  className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-sm focus:outline-none focus:border-[#E88D36]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreateStep}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#3B6E4C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2E583C]"
              >
                Create Step
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewStepForm(false);
                  setNewStepForm({ step_number: "", title: "", description: "" });
                }}
                className="px-5 py-2 rounded-xl border border-[#E5DCDB] text-xs font-bold uppercase tracking-wider text-[#2C221E] hover:bg-[#FAF6EE]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {howToUseLoading ? (
          <div className="flex items-center gap-3 text-[#685B55] py-6">
            <RefreshCw className="animate-spin text-[#E88D36]" size={18} />
            <span className="text-sm font-semibold">Loading steps...</span>
          </div>
        ) : howToUseSteps.length === 0 ? (
          <div className="rounded-3xl bg-white border border-dashed border-[#E5DCDB] p-10 text-center text-[#685B55] text-sm font-semibold">
            No steps yet. Click "Add Step" to create the first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...howToUseSteps]
              .sort((a, b) => (a.sort_order ?? a.step_number) - (b.sort_order ?? b.step_number))
              .map((step) => {
                const isEditing = editingStep?.id === step.id;
                return (
                  <div
                    key={step.id}
                    className="rounded-3xl bg-white border border-[#E5DCDB] p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-[#2C221E] text-[#FFB800] text-xs font-black uppercase rounded-lg tracking-wider">
                        Step 0{step.step_number}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingStep(isEditing ? null : { ...step })}
                          className="p-2 rounded-lg text-[#2C221E] hover:bg-[#FAF6EE]"
                          title="Edit step"
                        >
                          {isEditing ? <X size={15} /> : <Pencil size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-2 rounded-lg text-[#D93333] hover:bg-red-50"
                          title="Delete step"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Image upload */}
                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-[#E5DCDB] bg-[#FAF6EE] flex items-center justify-center overflow-hidden relative">
                      {step.image_url ? (
                        <img
                          src={getImageUrl(step.image_url)}
                          alt={step.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-[#685B55] space-y-1">
                          <ImageIcon size={20} className="mx-auto text-[#E88D36]" />
                          <p className="text-[10px] font-bold uppercase">No Image</p>
                        </div>
                      )}
                      {uploadingStepId === step.id && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <RefreshCw className="animate-spin text-[#E88D36]" size={18} />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id={`step-img-${step.id}`}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleStepImageUpload(step.id, f);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor={`step-img-${step.id}`}
                      className="w-full block text-center py-2 px-4 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3D302B] cursor-pointer transition"
                    >
                      Upload Step Image
                    </label>

                    {isEditing ? (
                      <div className="space-y-3 pt-2 border-t border-[#FAF6EE]">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingStep.title}
                            onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-sm focus:outline-none focus:border-[#E88D36]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={editingStep.description}
                            onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-[#E5DCDB] text-sm focus:outline-none focus:border-[#E88D36]"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-[#2C221E]">
                          <input
                            type="checkbox"
                            checked={editingStep.is_active}
                            onChange={(e) => setEditingStep({ ...editingStep, is_active: e.target.checked })}
                            className="w-4 h-4 rounded text-[#3B6E4C] focus:ring-[#3B6E4C]"
                          />
                          <span>Active</span>
                        </label>
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleUpdateStep}
                            disabled={saving}
                            className="px-5 py-2 rounded-xl bg-[#3B6E4C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2E583C]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStep(null)}
                            className="px-5 py-2 rounded-xl border border-[#E5DCDB] text-xs font-bold uppercase tracking-wider text-[#2C221E] hover:bg-[#FAF6EE]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[#FAF6EE]">
                        <p className="text-sm font-bold text-[#2C221E]">{step.title}</p>
                        <p className="text-xs text-[#685B55] mt-1">{step.description}</p>
                        {!step.is_active && (
                          <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-wider text-[#D93333]">
                            Inactive
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── SECTION 4: NATURAL GOODNESS ── */}
      <div className="rounded-3xl bg-white border border-[#E5DCDB] p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E88D36]/10 text-[#E88D36] flex items-center justify-center font-black">
              4
            </div>
            <h2 className="text-lg font-black uppercase text-[#2C221E] tracking-tight">
              NATURAL GOODNESS SECTION
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#685B55] uppercase tracking-wider">
            Image publishes instantly · Text saves as draft
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
          {/* Image Upload & Preview */}
          <div className="md:col-span-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">
              Product Image
            </p>
            <div className="w-full h-44 rounded-2xl border-2 border-dashed border-[#E5DCDB] bg-[#FAF6EE] flex items-center justify-center p-3 relative overflow-hidden">
              {ngImage ? (
                <img
                  src={getImageUrl(ngImage)}
                  alt="Natural Goodness"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-[#685B55] space-y-1">
                  <ImageIcon size={24} className="mx-auto text-[#E88D36]" />
                  <p className="text-xs font-bold uppercase">No Image Uploaded</p>
                </div>
              )}
              {ngUploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-[#E88D36]" size={20} />
                </div>
              )}
            </div>
            <input
              type="file"
              id="ng-image-input"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleNaturalGoodnessImageUpload(f);
              }}
              className="hidden"
            />
            <label
              htmlFor="ng-image-input"
              className="w-full block text-center py-2 px-4 rounded-xl bg-[#2C221E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#3D302B] cursor-pointer shadow-sm transition"
            >
              Upload New Image
            </label>
          </div>

          {/* Heading & Tagline */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Heading
              </label>
              <input
                type="text"
                value={naturalGoodnessDraft.title}
                onChange={(e) =>
                  setNaturalGoodnessDraft({ ...naturalGoodnessDraft, title: e.target.value })
                }
                placeholder="e.g. NATURAL GOODNESS"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DCDB] text-sm font-semibold text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={naturalGoodnessDraft.subtitle}
                onChange={(e) =>
                  setNaturalGoodnessDraft({ ...naturalGoodnessDraft, subtitle: e.target.value })
                }
                placeholder="e.g. HEALTHY YOU · BETTER TOMORROW"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DCDB] text-sm font-medium text-[#2C221E] focus:outline-none focus:border-[#E88D36]"
              />
            </div>
            <p className="text-[11px] text-[#685B55]">
              Heading and tagline save with "Save Draft" / "Publish Live" above. The image updates immediately.
            </p>
          </div>
        </div>
      </div>
      
      </>
      ) : (
        <div className="w-full">
          <AdminReviewsPage />
        </div>
      )}

      {/* ── FOOTER PUBLISH BAR ── */}

      <div className="fixed bottom-0 left-64 right-0 bg-white/95 backdrop-blur-md border-t border-[#E5DCDB] px-8 py-4 flex items-center justify-between shadow-2xl z-40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E88D36] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">
            CMS Ready
          </span>
          <span className="text-xs text-[#685B55] hidden sm:inline">
            · Changes won't affect live customers until you click Publish
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="px-5 py-2 rounded-xl border border-[#2C221E]/20 bg-white text-xs font-bold uppercase tracking-wider text-[#2C221E] hover:bg-[#FAF6EE]"
          >
            {saving ? "Saving Draft..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handlePublishLive}
            disabled={publishing || saving}
            className="px-6 py-2 rounded-xl bg-[#E88D36] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#E88D36]/30 hover:bg-[#D47E2A]"
          >
            {publishing ? "Publishing..." : "PUBLISH LIVE"}
          </button>
        </div>
      </div>
    </div>
  );
}

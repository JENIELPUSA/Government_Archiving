import React, { useState, useContext, useEffect } from "react";
import { Layout, Save, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { LandingPageContext } from "../../../contexts/LandingPageContext/LandingPageContext";

export default function ContentManagement() {
  const { SaveLandingPage, landingData } = useContext(LandingPageContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    Mission: "",
    Vission: "",
  });

  const [images, setImages] = useState(Array(10).fill(null));
  const [originalImages, setOriginalImages] = useState(Array(10).fill(null));
  const [originalFormData, setOriginalFormData] = useState({
    title: "",
    subtitle: "",
    Mission: "",
    Vission: "",
  });

  useEffect(() => {
    if (landingData) {
      setFormData({
        title: landingData.title || "",
        subtitle: landingData.subtitle || "",
        Mission: landingData.Mission || "",
        Vission: landingData.Vission || "",
      });
      setOriginalFormData({
        title: landingData.title || "",
        subtitle: landingData.subtitle || "",
        Mission: landingData.Mission || "",
        Vission: landingData.Vission || "",
      });

      const avatarUrls =
        landingData.avatar && Array.isArray(landingData.avatar)
          ? landingData.avatar.slice(0, 10).map((item) => item.url)
          : [];
      const newImages = Array(10).fill(null);
      avatarUrls.forEach((url, idx) => {
        newImages[idx] = url;
      });
      setImages(newImages);
      setOriginalImages([...newImages]);
    }
  }, [landingData]);

  // Hanapin ang unang empty slot (index ng unang null)
  const firstEmptyIndex = images.findIndex(img => img === null);

  const handleImageUpload = (index, event) => {
    // Payagan lang ang upload kung ito ang unang empty slot
    if (index !== firstEmptyIndex) return;
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...images];
        newImages[index] = e.target.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index, event) => {
    event.stopPropagation();
    const newImages = [...images];
    newImages[index] = null;
    // Pagkatapos mag-remove, kailangan i-shift pakanan? Hindi na, basta magkakaroon ng bagong first empty.
    // Pero para mapanatili ang pagkakasunod, dapat ayusin ang array para walang bakanteng slot bago ang mga puno.
    // Dapat i-collapse ang array: alisin ang null at ilipat ang mga sumunod pakanan.
    // Mas maganda: pag nag-remove, ilipat ang lahat ng susunod na images pakanan para maging contiguous.
    const filtered = newImages.filter(img => img !== null);
    const reordered = [...filtered, ...Array(10 - filtered.length).fill(null)];
    setImages(reordered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const discardChanges = () => {
    setFormData({ ...originalFormData });
    setImages([...originalImages]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const standardizeText = (text) => (text ? text.trim() : "");

    try {
      const newImagesDataURL = images.filter((img) => img && img.startsWith("data:image"));
      const existingImageUrls = images.filter((img) => img && !img.startsWith("data:image"));

      const payload = {
        title: standardizeText(formData.title),
        subtitle: standardizeText(formData.subtitle),
        Mission: standardizeText(formData.Mission),
        Vission: standardizeText(formData.Vission),
        new_images: newImagesDataURL,
        existing_images: existingImageUrls,
      };

      await SaveLandingPage(payload);

      setOriginalFormData({ ...formData });
      setOriginalImages([...images]);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 flex justify-center items-start font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                <Layout size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
            </div>
            <p className="text-slate-400 text-sm">Update your landing page content and images (max 10)</p>
          </div>
          <div className="hidden md:flex gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 px-4 py-2 rounded-full text-slate-300 border border-slate-700 uppercase tracking-wider">
              <CheckCircle2 size={14} className="text-emerald-500" /> System Online
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
          {/* Core Information */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">Core Information</h2>
              <div className="h-[1px] w-full bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Main Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter main title..."
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm disabled:opacity-60"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="Enter subtitle..."
                  value={formData.subtitle}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Mission Statement</label>
                <textarea
                  name="Mission"
                  value={formData.Mission}
                  onChange={handleChange}
                  rows="5"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm resize-none leading-relaxed disabled:opacity-60"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Vision Statement</label>
                <textarea
                  name="Vission"
                  value={formData.Vission}
                  onChange={handleChange}
                  rows="5"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm resize-none leading-relaxed disabled:opacity-60"
                />
              </div>
            </div>
          </section>

          {/* Image Gallery */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">Image Gallery (max 10)</h2>
              <div className="h-[1px] w-full bg-slate-100"></div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-wider">
                {images.filter((img) => img !== null).length} / 10
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {images.map((img, index) => {
                const isFirstEmpty = index === firstEmptyIndex;
                const showUpload = img === null && isFirstEmpty;
                const showEmptyBlock = img === null && !isFirstEmpty;
                return (
                  <div
                    key={index}
                    className="aspect-square border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-white relative overflow-hidden"
                  >
                    {img ? (
                      <>
                        <img src={img} alt={`Slot ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => removeImage(index, e)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                          type="button"
                          disabled={isSubmitting}
                        >
                          X
                        </button>
                      </>
                    ) : showUpload ? (
                      <label
                        className={`cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-400 ${
                          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span className="text-xs">Upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          disabled={isSubmitting}
                        />
                      </label>
                    ) : showEmptyBlock ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                        Empty
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 text-center">
              Upload images sequentially. Only the first empty slot shows the plus sign.
            </p>
          </section>

          {/* Actions */}
          <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 disabled:bg-indigo-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Publish Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useRef, useContext, useEffect } from 'react';
import { Upload, Layout, Save, Image as ImageIcon, CheckCircle2, Trash2, Loader2, XCircle } from 'lucide-react';
import { LandingPageContext } from '../../../contexts/LandingPageContext/LandingPageContext';

export default function ContentManagement() {
    const { SaveLandingPage, landingData } = useContext(LandingPageContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial State para sa Form
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        Mission: '',
        Vission: '', // Note: Double 's' base sa iyong data object
    });

    // State para sa Images (Existing + New)
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    // 1. DATA HYDRATION: I-populate ang form gamit ang landingData
    useEffect(() => {
        if (landingData) {
            setFormData({
                title: landingData.title || '',
                subtitle: landingData.subtitle || '',
                Mission: landingData.Mission || '',
                Vission: landingData.Vission || '',
            });

            if (landingData.avatar && Array.isArray(landingData.avatar)) {
                // I-map ang existing images mula sa database
                const existingImages = landingData.avatar.map((img, index) => ({
                    id: img.id || `existing-${index}`,
                    url: img.url, // Siguraduhin na 'url' ang field name sa database
                    name: `Current Image ${index + 1}`,
                    file: null // Marka na hindi ito bagong upload
                }));
                setPreviews(existingImages);
            }
        }
    }, [landingData]);

    // Cleanup para sa Blob URLs para maiwasan ang memory leak
    useEffect(() => {
        return () => {
            previews.forEach(file => {
                if (file.url && file.url.startsWith('blob:')) {
                    URL.revokeObjectURL(file.url);
                }
            });
        };
    }, [previews]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newPreviews = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            name: file.name,
            file: file // Ito ang actual File object para sa upload
        }));

        setPreviews(prev => [...prev, ...newPreviews]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (id) => {
        setPreviews(prev => {
            const targeted = prev.find(img => img.id === id);
            if (targeted && targeted.url.startsWith('blob:')) {
                URL.revokeObjectURL(targeted.url);
            }
            return prev.filter(img => img.id !== id);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const standardizeText = (text) => text ? text.trim() : "";

        try {
            // I-filter lang ang mga BAGONG files na i-a-upload
            const newImageFiles = previews
                .filter(p => p.file instanceof File)
                .map(p => p.file);

            // Kunin ang IDs o URLs ng images na itinira (hindi binura)
            const retainedImages = previews
                .filter(p => !p.file)
                .map(p => p.url);

            const payload = {
                title: standardizeText(formData.title),
                subtitle: standardizeText(formData.subtitle),
                Mission: standardizeText(formData.Mission),
                Vission: standardizeText(formData.Vission),
                avatar: newImageFiles.length > 0 ? newImageFiles : null,
                existing_assets: retainedImages // Ipadala ito para malaman ng backend kung ano ang hindi dapat burahin
            };

            await SaveLandingPage(payload);
            alert("Changes published successfully!");
        } catch (error) {
            console.error("Submission Error:", error);
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
                        <p className="text-slate-400 text-sm">Update your system's landing page content and visual assets</p>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-slate-800 px-4 py-2 rounded-full text-slate-300 border border-slate-700 uppercase tracking-wider">
                            <CheckCircle2 size={14} className="text-emerald-500" /> System Online
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">

                    {/* Core Information Section */}
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
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm"
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
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm"
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
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm resize-none leading-relaxed"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Vision Statement</label>
                                <textarea
                                    name="Vission"
                                    value={formData.Vission}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-slate-700 shadow-sm resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Visual Assets Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">Visual Assets</h2>
                            <div className="h-[1px] w-full bg-slate-100"></div>
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-wider">
                                {previews.length} Total
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="lg:col-span-1 border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-white transition-all cursor-pointer group min-h-[280px]"
                            >
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-all mb-4 text-slate-400">
                                    <Upload size={32} />
                                </div>
                                <h3 className="font-bold text-slate-700 text-sm">Upload New Media</h3>
                                <p className="text-slate-400 text-xs mt-2 text-center">Click to browse (Max 10MB)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>

                            <div className="lg:col-span-2 bg-slate-50/30 rounded-3xl border border-slate-100 p-6 min-h-[280px]">
                                {previews.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                                        {previews.map((img) => (
                                            <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
                                                <img
                                                    src={img.url}
                                                    alt="preview"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(img.id)}
                                                        className="p-3 bg-red-500 rounded-2xl text-white hover:scale-110 transition-all"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                {/* Label if it's a new upload */}
                                                {img.file && (
                                                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] px-2 py-1 rounded-full font-bold uppercase">
                                                        New
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                                        <ImageIcon size={40} strokeWidth={1} className="opacity-20 mb-4" />
                                        <p className="text-sm font-medium italic">No assets selected yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Form Actions */}
                    <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => window.confirm("Discard changes?") && window.location.reload()}
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <XCircle size={18} />
                            Discard Changes
                        </button>
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
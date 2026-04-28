import React from "react";
import axios from "axios";
import { FaFileAlt, FaSearch, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaSpinner } from "react-icons/fa";

export const UnifiedFileTable = ({ 
    FilesByPosition = [], 
    PositioncurentPage = 1, 
    PositiontotalPage = 1, 
    Totaldata = 0, 
    onPageChange,
    onSearchChange,
    searchTerm 
}) => {
    // State para sa loading indicator ng bawat file
    const [loadingFileId, setLoadingFileId] = React.useState(null);

    const handleViewPDF = async (fileId) => {
        try {
            setLoadingFileId(fileId); // Simulan ang loading animation

            const res = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/streampublic/${fileId}`, 
                { responseType: "blob" }
            );

            // Gumawa ng Blob URL mula sa PDF data
            const fileBlob = new Blob([res.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(fileBlob);

            // I-open sa bagong window/tab
            const newTab = window.open(fileURL, "_blank");
            
            // Kung sakaling blocked ang popup, mag-fallback sa direct link
            if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                alert("Pop-up blocked! Please allow pop-ups for this site to view the PDF.");
            }

        } catch (error) {
            console.error("Failed to open PDF:", error);
            alert("Error: Hindi ma-open ang dokumento.");
        } finally {
            setLoadingFileId(null); // Tapos na ang loading
        }
    };

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {/* Header / Search */}
            <div className="flex flex-col items-center justify-between gap-3 border-b border-gray-50 bg-white px-4 py-3 sm:flex-row">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Documents</h3>
                    <span className="rounded-full bg-blue-50 px-2 text-[10px] font-medium text-blue-500">
                        {Totaldata} total • Page {PositioncurentPage}/{PositiontotalPage}
                    </span>
                </div>
                <div className="relative w-full sm:w-56">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search document title..."
                        value={searchTerm}
                        className="w-full rounded-md border border-gray-100 bg-gray-50/50 py-1 pl-8 pr-4 text-[11px] transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Body */}
            <div className="custom-scrollbar max-h-[300px] overflow-auto">
                <table className="w-full table-fixed border-collapse text-left text-[11px]">
                    <thead className="sticky top-0 z-10 bg-gray-50 text-[9px] font-bold uppercase text-gray-400">
                        <tr>
                            <th className="w-1/2 px-4 py-2">Document Title</th>
                            <th className="w-1/4 px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {FilesByPosition.length > 0 ? (
                            FilesByPosition.map((file) => (
                                <tr key={file._id} className="group hover:bg-blue-50/20">
                                    <td className="px-4 py-3">
                                        <div className="flex items-start gap-2">
                                            <FaFileAlt className="mt-0.5 shrink-0 text-blue-400" />
                                            <span className="block break-words font-semibold text-gray-700 leading-tight">
                                                {file.title || "Untitled Document"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => handleViewPDF(file._id)}
                                            disabled={loadingFileId === file._id}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[9px] font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-300"
                                        >
                                            {loadingFileId === file._id ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <>VIEW <FaExternalLinkAlt className="text-[7px]" /></>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="2" className="py-10 text-center text-gray-400">No documents found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
                <button 
                    disabled={PositioncurentPage <= 1} 
                    onClick={() => onPageChange(PositioncurentPage - 1)} 
                    className="disabled:opacity-20 hover:text-blue-500 transition-colors"
                >
                    <FaChevronLeft size={10}/>
                </button>
                <span className="text-[9px] font-bold text-gray-400 uppercase">PAGE {PositioncurentPage} OF {PositiontotalPage}</span>
                <button 
                    disabled={PositioncurentPage >= PositiontotalPage} 
                    onClick={() => onPageChange(PositioncurentPage + 1)} 
                    className="disabled:opacity-20 hover:text-blue-500 transition-colors"
                >
                    <FaChevronRight size={10}/>
                </button>
            </div>
        </div>
    );
};

export default UnifiedFileTable;
import React, { useState, useEffect, useRef } from "react";
import logo from "../../../assets/republic.png";

const FooterQuickAccess = ({
    currentPage,
    setCurrentPage,
    onNavigateToSection,
    onOpenLegislativeTracker,
    createSuggestion  // <-- New prop for creating suggestions/payloads
}) => {
    const lastClickedPageRef = useRef(null);

    // State for suggestion box
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
        sendCopy: false
    });

    // State untuk menyimpan hasil deteksi browser
    const [browserInfo, setBrowserInfo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fungsi deteksi browser
    const detectBrowser = () => {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";

        if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
            browserName = "Google Chrome";
        } else if (userAgent.indexOf("Edg") > -1) {
            browserName = "Microsoft Edge";
        } else if (userAgent.indexOf("Firefox") > -1) {
            browserName = "Mozilla Firefox";
        } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
            browserName = "Apple Safari";
        } else if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
            browserName = "Opera";
        }

        return browserName;
    };

    // Ambil info browser saat komponen pertama kali di-load
    useEffect(() => {
        const browser = detectBrowser();
        setBrowserInfo(browser);
    }, []);

    // Fungsi untuk menentukan email admin berdasarkan browser
    const getTargetAdminEmail = () => {
        const browser = browserInfo;

        // Contoh auto-filter: jika browser Chrome, kirim ke email khusus Chrome
        if (browser === "Google Chrome") {
            return "admin.chrome@example.com";
        }
        // Jika Firefox, kirim ke email khusus Firefox
        else if (browser === "Mozilla Firefox") {
            return "admin.firefox@example.com";
        }
        // Default email (email admin asli)
        return "plgu.sp.emielorrianneho@gmail.com";
    };

    const pages = [
        { id: "hero", label: "Home" },
        { id: "news", label: "News & Info" },
        { id: "about", label: "About Us" }
    ];

    const governmentLinks = [
        { name: "Office of the President", url: "https://op-proper.gov.ph" },
        { name: "Office of the Vice President", url: "https://www.ovp.gov.ph" },
        { name: "Senate of the Philippines", url: "https://legacy.senate.gov.ph" },
        { name: "House of Representatives", url: "https://www.congress.gov.ph" },
        { name: "Sandiganbayan", url: "https://sb.judiciary.gov.ph" },
        { name: "Supreme Court", url: "https://sc.judiciary.gov.ph" },
        { name: "GOV.PH", url: "https://www.gov.ph" },
        { name: "Biliran Official Website", url: "https://biliran.gov.ph" }
    ];

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const top = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    const handlePageClick = (pageId) => {
        if (onNavigateToSection) {
            onNavigateToSection(pageId);
            return;
        }
        const isSamePage = lastClickedPageRef.current === pageId && currentPage === pageId;

        if (isSamePage) {
            scrollToSection(pageId);
            return;
        }

        setCurrentPage(pageId);
        lastClickedPageRef.current = pageId;

        if (pageId === "hero") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            scrollToSection(pageId);
        }
    };

    const handleOpenLegislativeTracker = () => {
        window.open('https://script.google.com/macros/s/AKfycbyEFF8gVrAiLcg2DDvjf3Wc1YPGgsAnRIAPICxNbmd0rEMhHsY8uEfultzfF9rjeyPW/exec?page=Dashboard', '_blank');
    };

    // Function to create payload object
    const createPayloadObject = () => {
        const timestamp = new Date().toISOString();
        
        return {
            id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: timestamp,
            suggestion: {
                name: formData.name || "Anonymous",
                email: formData.email || "Not Provided",
                message: formData.message,
                sendCopy: formData.sendCopy
            },
            metadata: {
                browserInfo: browserInfo,
                userAgent: navigator.userAgent,
                targetEmail: getTargetAdminEmail(),
                submittedAt: timestamp,
                pageUrl: window.location.href,
                referrer: document.referrer || "Direct",
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                platform: navigator.platform,
                timestamp: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
            },
            systemInfo: {
                localStorage: typeof localStorage !== 'undefined',
                sessionStorage: typeof sessionStorage !== 'undefined',
                cookiesEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
                deviceMemory: navigator.deviceMemory || 'Unknown'
            }
        };
    };

    // Modified suggestion submit handler using createSuggestion
    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        
        // Validate message is not empty
        if (!formData.message.trim()) {
            alert("Please enter your suggestion or message.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Create payload object
            const payload = createPayloadObject();
            
            console.log('=== SENDING PAYLOAD VIA CREATESUGGESTION ===');
            console.log('Payload:', JSON.stringify(payload, null, 2));
            console.log('=============================================');

            // Use createSuggestion prop to send payload to main
            if (createSuggestion && typeof createSuggestion === 'function') {
                const result = await createSuggestion(payload);
                
                if (result && result.success) {
                    console.log('✅ Suggestion payload sent successfully:', result);
                    
                    // Optional: Still send email as backup
                    sendEmailBackup(payload);
                    
                    // Show success message
                    alert(`✅ Suggestion sent successfully!\n\nReference ID: ${payload.id}\nThank you for your feedback!`);
                    
                    // Reset form
                    setFormData({ name: "", email: "", message: "", sendCopy: false });
                } else {
                    throw new Error(result?.error || 'Failed to send suggestion');
                }
            } else {
                console.warn('createSuggestion prop is not provided or not a function');
                // Fallback to email only
                sendEmailBackup(payload);
                alert('Suggestion sent via email. Thank you for your feedback!');
                setFormData({ name: "", email: "", message: "", sendCopy: false });
            }
        } catch (error) {
            console.error('Error sending suggestion:', error);
            alert(`Error sending suggestion: ${error.message}\n\nYour suggestion has been saved locally and will be sent when connection is restored.`);
            
            // Store failed suggestion in localStorage
            const failedSuggestions = JSON.parse(localStorage.getItem('failed_suggestions') || '[]');
            failedSuggestions.push(createPayloadObject());
            localStorage.setItem('failed_suggestions', JSON.stringify(failedSuggestions));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Backup email function
    const sendEmailBackup = (payload) => {
        const targetAdminEmail = getTargetAdminEmail();
        const subject = encodeURIComponent(`File Archiving Suggestion from ${payload.suggestion.name}`);
        
        let bodyText = `=== SUGGESTION PAYLOAD ===\n`;
        bodyText += `Reference ID: ${payload.id}\n`;
        bodyText += `Timestamp: ${payload.timestamp}\n`;
        bodyText += `==========================\n\n`;
        bodyText += `SUGGESTION DETAILS:\n`;
        bodyText += `-----------------------------------\n`;
        bodyText += `Name: ${payload.suggestion.name}\n`;
        bodyText += `User Email: ${payload.suggestion.email}\n`;
        bodyText += `Message: ${payload.suggestion.message}\n`;
        bodyText += `Send Copy: ${payload.suggestion.sendCopy ? "Yes" : "No"}\n`;
        bodyText += `-----------------------------------\n\n`;
        bodyText += `METADATA:\n`;
        bodyText += `-----------------------------------\n`;
        bodyText += `Browser: ${payload.metadata.browserInfo}\n`;
        bodyText += `User Agent: ${payload.metadata.userAgent}\n`;
        bodyText += `Page URL: ${payload.metadata.pageUrl}\n`;
        bodyText += `Screen: ${payload.metadata.screenResolution}\n`;
        bodyText += `Language: ${payload.metadata.language}\n`;
        bodyText += `Platform: ${payload.metadata.platform}\n`;
        bodyText += `-----------------------------------\n\n`;
        bodyText += `SYSTEM INFO:\n`;
        bodyText += `-----------------------------------\n`;
        bodyText += `Connection Type: ${payload.systemInfo.connectionType}\n`;
        bodyText += `Device Memory: ${payload.systemInfo.deviceMemory}\n`;
        bodyText += `Cookies Enabled: ${payload.systemInfo.cookiesEnabled}\n`;
        bodyText += `-----------------------------------\n`;
        bodyText += `Submitted via Footer Suggestion Box with Payload System.`;
        
        const body = encodeURIComponent(bodyText);
        let mailtoUrl = `mailto:${targetAdminEmail}?subject=${subject}&body=${body}`;
        
        if (payload.suggestion.sendCopy && payload.suggestion.email) {
            mailtoUrl += `&cc=${encodeURIComponent(payload.suggestion.email)}`;
        }
        
        // Open email in new window as backup
        window.open(mailtoUrl, "_blank");
    };

    // ✅ FIXED: Removed createSuggestion dependency to prevent infinite re-renders
    // Optional: Retry failed suggestions on component mount only (runs once)
    useEffect(() => {
        const retryFailedSuggestions = async () => {
            const failedSuggestions = JSON.parse(localStorage.getItem('failed_suggestions') || '[]');
            if (failedSuggestions.length > 0 && createSuggestion) {
                console.log(`Retrying ${failedSuggestions.length} failed suggestions...`);
                for (const suggestion of failedSuggestions) {
                    try {
                        await createSuggestion(suggestion);
                        console.log('Retried suggestion sent successfully:', suggestion.id);
                    } catch (error) {
                        console.error('Failed to retry suggestion:', suggestion.id, error);
                    }
                }
                // Clear retried suggestions
                localStorage.removeItem('failed_suggestions');
            }
        };
        
        retryFailedSuggestions();
    }, []); // ✅ Empty dependency array - runs only once on mount

    return (
        <footer className="bg-blue-950 border-t border-blue-800 shadow-lg">
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* MAIN FOOTER CONTENT - RESPONSIVE LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
                    {/* COLUMN 1: BRAND & DESCRIPTION */}
                    <div className="lg:col-span-1">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                                    <img
                                        src={logo}
                                        alt="Republic of the Philippines Seal"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-lg font-bold text-white">
                                        Republic of the Philippines
                                    </h3>
                                    <p className="text-xs text-blue-300 mt-1">
                                        Province of Biliran
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-blue-200 text-center md:text-left">
                                Serving with integrity, transparency, and dedication for
                                the progress of every Biliranon.
                            </p>
                        </div>

                        <div className="mt-4 sm:mt-6">
                            <p className="text-xs text-blue-300 italic">
                                All content is in the public domain unless otherwise stated.
                            </p>
                        </div>
                    </div>

                    {/* COLUMN 2: QUICK LINKS */}
                    <div>
                        <h4 className="text-white font-bold mb-4 md:mb-6 pb-2 border-b-2 border-red-600 text-base md:text-lg">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {pages.map((p) => (
                                <li key={p.id}>
                                    <button
                                        onClick={() => handlePageClick(p.id)}
                                        className={`text-left text-sm transition-colors duration-200 w-full flex items-center ${currentPage === p.id
                                            ? 'text-yellow-300 font-semibold'
                                            : 'text-blue-200 hover:text-yellow-300'
                                            }`}
                                    >
                                        <span className="mr-2 text-xs">›</span>
                                        {p.label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={handleOpenLegislativeTracker}
                                    className="text-left text-sm transition-colors duration-200 w-full flex items-center text-blue-200 hover:text-yellow-300"
                                >
                                    <span className="mr-2 text-xs">›</span>
                                    Legislative Tracking System
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMN 3: GOVERNMENT LINKS */}
                    <div>
                        <h4 className="text-white font-bold mb-4 md:mb-6 pb-2 border-b-2 border-red-600 text-base md:text-lg">
                            Government Links
                        </h4>
                        <ul className="space-y-2 sm:space-y-3">
                            {governmentLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-200 hover:text-yellow-300 text-xs sm:text-sm transition-colors duration-200 flex items-center"
                                    >
                                        <span className="mr-2 text-xs">›</span>
                                        <span className="truncate">{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* COLUMN 4: SUGGESTION BOX FORM */}
                    <div>
                        <h4 className="text-white font-bold mb-4 md:mb-6 pb-2 border-b-2 border-red-600 text-base md:text-lg">
                            Suggestion Box
                        </h4>
                        <form onSubmit={handleSuggestionSubmit} className="space-y-3">
                            {/* Name input */}
                            <div>
                                <input
                                    type="text"
                                    id="footer-suggestion-name"
                                    placeholder="Your Name (Optional)"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, name: e.target.value }));
                                    }}
                                    disabled={isSubmitting}
                                    className="block w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-white focus:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Email input */}
                            <div>
                                <input
                                    type="email"
                                    id="footer-suggestion-email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, email: e.target.value }));
                                    }}
                                    disabled={isSubmitting}
                                    className="block w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-white focus:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Message textarea */}
                            <div>
                                <textarea
                                    id="footer-suggestion-message"
                                    rows="3"
                                    placeholder="Your suggestion or message..."
                                    value={formData.message}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, message: e.target.value }));
                                    }}
                                    required
                                    disabled={isSubmitting}
                                    className="block w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none transition-all duration-300 focus:border-white focus:bg-white/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                ></textarea>
                            </div>
                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-block w-full rounded-lg bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-950 transition-all duration-300 hover:bg-neutral-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Suggestion'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-blue-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                        <p className="text-blue-300 text-xs sm:text-sm text-center md:text-left">
                            &copy; {new Date().getFullYear()} Sangguniang Panlalawigan ng Biliran.
                            All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterQuickAccess;
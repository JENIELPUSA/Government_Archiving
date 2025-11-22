import React from "react";
import { motion } from "framer-motion";
import { Facebook, ExternalLink } from "lucide-react";

const FBPageEmbed = () => {
    const [show, setShow] = React.useState(false);
    const [iframeLoaded, setIframeLoaded] = React.useState(false);

    React.useEffect(() => {
        setShow(true);
    }, []);

    const handleIframeLoad = () => {
        setIframeLoaded(true);
    };

    const pageUrl = "https://web.facebook.com/spbiliran2019";
    const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
        pageUrl
    )}&tabs=timeline&width=340&height=700&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true`;

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-2 mx-auto w-full overflow-hidden rounded-lg bg-white shadow-lg border border-blue-200"
            role="complementary"
            aria-label="Facebook Page"
        >
            {/* HEADER */}
            <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="rounded-lg p-2 bg-white/20">
                    <Facebook className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">
                        Follow Us on Facebook
                    </h3>
                    <p className="text-sm text-blue-100">Stay updated with our latest news</p>
                </div>
            </div>

            {/* EMBEDDED PAGE */}
            <div className="flex justify-center p-3 bg-gray-50">
                <div className="relative w-full max-w-[340px]">
                    {/* Loading state */}
                    {!iframeLoaded && (
                        <div
                            className="flex min-h-[700px] w-full items-center justify-center rounded-xl bg-gray-200"
                            aria-live="polite"
                            aria-label="Loading Facebook page"
                        >
                            <div className="text-center">
                                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                <p className="text-gray-600">Loading Facebook page...</p>
                            </div>
                        </div>
                    )}

                    <motion.iframe
                        initial={{ opacity: 0 }}
                        animate={{ opacity: iframeLoaded ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                        title="Provincial Government Facebook Page"
                        src={src}
                        className={`min-h-[700px] w-full rounded-xl ${iframeLoaded ? "block" : "absolute inset-0"}`}
                        style={{ border: "none", overflow: "hidden" }}
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        loading="lazy"
                        onLoad={handleIframeLoad}
                        aria-label="Provincial Government Facebook Page"
                    />
                </div>
            </div>

            {/* FALLBACK LINK */}
            <div className="border-t border-gray-200 p-4">
                <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Visit our Facebook page (opens in new window)"
                >
                    <ExternalLink className="h-4 w-4" />
                    Visit our Facebook page
                </a>
                <p className="mt-2 text-center text-xs text-gray-500">
                    Get the latest updates and announcements
                </p>
            </div>
        </motion.div>
    );
};

export default FBPageEmbed;
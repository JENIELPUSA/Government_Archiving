import React, { useState, useEffect, useContext } from "react";
import { ChevronLeft, ChevronRight, Folder, FileText, Calendar, User, Tag, Eye, Download, Search } from "lucide-react";
import { motion } from "framer-motion";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import defaultCover from "../../../../src/assets/billpicture.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const mockPictures = [
        {
            id: 1,
            title: "Provincial Council Leads Waste Management Initiative",
            category: "Environment",
            date: "May 15, 2024",
            excerpt:
                "The provincial council has launched a new initiative to tackle solid waste management, focusing on community-led recycling programs and public awareness campaigns.",
            avatar: { url: "https://placehold.co/1920x1080/6366f1/FFFFFF?text=Waste+Management" },
        },
        {
            id: 2,
            title: "New Tourism Ordinance to Boost Local Economy",
            category: "Tourism",
            date: "May 10, 2024",
            excerpt:
                "A new ordinance has been filed to promote tourism in the province, aiming to attract more visitors and create new opportunities for local businesses.",
            avatar: { url: "https://placehold.co/1920x1080/6d28d9/FFFFFF?text=Tourism+Ordinance" },
        },
        {
            id: 3,
            title: "Community Youth Program Gets Final Approval",
            category: "Youth",
            date: "May 8, 2024",
            excerpt:
                "The much-anticipated youth program ordinance has been approved, paving the way for new educational and recreational opportunities for the youth.",
            avatar: { url: "https://placehold.co/1920x1080/4338ca/FFFFFF?text=Youth+Program" },
        },
        {
            id: 4,
            title: "Local Products Ordinance to be Finalized",
            category: "Economy",
            date: "May 5, 2024",
            excerpt:
                "A new ordinance aimed at promoting and protecting local products is in the final stages of review, with an expected approval date next month.",
            avatar: { url: "https://placehold.co/1920x1080/1e3a8a/FFFFFF?text=Local+Products" },
        },
    ];

    const { isLatestBill } = useContext(FilesDisplayContext);
    const mockArchiveDocuments = [
        {
            id: 1,
            title: "Environmental Impact Assessment Report 2024",
            category: "Documentation",
            type: "PDF",
            fileSize: "2.4 MB",
            date: "2024-05-20",
            author: "Environmental Committee",
            tags: ["Environment", "Assessment", "2024"],
            summary:
                "Comprehensive assessment of environmental initiatives implemented across the province, including waste management programs, air quality monitoring, and biodiversity conservation efforts. This report provides detailed analysis of environmental impact metrics and recommendations for future sustainable development projects.",
            avatar: { url: "https://placehold.co/800x600/059669/FFFFFF?text=Environmental+Report" },
            downloadUrl: "#",
            views: 234,
        },
        {
            id: 2,
            title: "Provincial Tourism Development Plan",
            category: "Documentation",
            type: "PDF",
            fileSize: "3.1 MB",
            date: "2024-05-18",
            author: "Tourism Development Board",
            tags: ["Tourism", "Development", "Strategy"],
            summary:
                "Strategic framework for tourism development in the province over the next five years. Includes infrastructure development plans, marketing strategies, cultural preservation initiatives, and economic impact projections. Features detailed maps, tourism circuit proposals, and stakeholder engagement protocols.",
            avatar: { url: "https://placehold.co/800x600/7c3aed/FFFFFF?text=Tourism+Plan" },
            downloadUrl: "#",
            views: 189,
        },
        {
            id: 3,
            title: "Youth Empowerment Program Documentation",
            category: "Documentation",
            type: "PDF",
            fileSize: "1.8 MB",
            date: "2024-05-15",
            author: "Youth Affairs Office",
            tags: ["Youth", "Education", "Programs"],
            summary:
                "Complete documentation of youth empowerment initiatives including scholarship programs, skills training workshops, and leadership development activities. Contains program outcomes, beneficiary testimonials, and statistical analysis of program effectiveness across different municipalities.",
            avatar: { url: "https://placehold.co/800x600/dc2626/FFFFFF?text=Youth+Programs" },
            downloadUrl: "#",
            views: 156,
        },
        {
            id: 4,
            title: "Local Product Certification Guidelines",
            category: "Documentation",
            type: "PDF",
            fileSize: "1.2 MB",
            date: "2024-05-12",
            author: "Economic Development Unit",
            tags: ["Economy", "Certification", "Local Products"],
            summary:
                "Guidelines and procedures for local product certification program designed to promote and protect indigenous and locally-manufactured goods. Includes quality standards, certification processes, marketing support mechanisms, and trade facilitation measures.",
            avatar: { url: "https://placehold.co/800x600/ea580c/FFFFFF?text=Product+Guidelines" },
            downloadUrl: "#",
            views: 98,
        },
        {
            id: 5,
            title: "Provincial Infrastructure Master Plan",
            category: "Documentation",
            type: "PDF",
            fileSize: "5.7 MB",
            date: "2024-05-08",
            author: "Infrastructure Committee",
            tags: ["Infrastructure", "Planning", "Development"],
            summary:
                "Comprehensive master plan for provincial infrastructure development including road networks, water systems, telecommunications, and public facilities. Features technical specifications, budget allocations, timeline projections, and environmental compliance measures.",
            avatar: { url: "https://placehold.co/800x600/0891b2/FFFFFF?text=Infrastructure+Plan" },
            downloadUrl: "#",
            views: 312,
        },
        {
            id: 6,
            title: "Annual Financial Audit Report 2023",
            category: "Documentation",
            type: "PDF",
            fileSize: "4.3 MB",
            date: "2024-05-05",
            author: "Provincial Auditor",
            tags: ["Finance", "Audit", "2023"],
            summary:
                "Independent audit report of provincial finances for fiscal year 2023, including budget utilization analysis, expenditure verification, revenue collection assessment, and compliance with financial regulations. Contains recommendations for improved financial management practices.",
            avatar: { url: "https://placehold.co/800x600/be185d/FFFFFF?text=Financial+Audit" },
            downloadUrl: "#",
            views: 445,
        },
    ];
 const navigate = useNavigate();
    const { pictures } = useContext(NewsDisplayContext);
    const newsItems = pictures.filter((item) => item.category === "Carousel");
    const documentsummary = pictures.filter((item) => item.category === "Documentation");
    const documentation = mockArchiveDocuments;
    const News = mockPictures;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [spCarouselIndex, setSPCarouselIndex] = useState(0);
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
    const [isHoveringSPCarousel, setIsHoveringSPCarousel] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [sortBy, setSortBy] = useState("date");

    const filteredDocuments = documentation.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === "All" || doc.tags.includes(filterCategory);
        return matchesSearch && matchesCategory;
    });

 
    const handdleVewDocument = (news) => {
             navigate("/expand-pdf", {
            state: {
                fileId: news._id,
                fileData: news,
                from: "/documents",
            },
        });
    };

    // Sort documents
    const sortedDocuments = [...filteredDocuments].sort((a, b) => {
        switch (sortBy) {
            case "date":
                return new Date(b.date) - new Date(a.date);
            case "title":
                return a.title.localeCompare(b.title);
            case "views":
                return b.views - a.views;
            default:
                return 0;
        }
    });

    const categories = ["All", ...Array.from(new Set(documentation.flatMap((doc) => doc.tags)))];

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex + 1) % newsItems.length));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex - 1 + newsItems.length) % newsItems.length));
    };

    // SP Carousel navigation functions
    const nextSPSlide = () => {
        setSPCarouselIndex((prevIndex) => (prevIndex + 1) % documentsummary.length);
    };

    const prevSPSlide = () => {
        setSPCarouselIndex((prevIndex) => (prevIndex - 1 + documentsummary.length) % documentsummary.length);
    };

    useEffect(() => {
        if (isHoveringCarousel || newsItems.length === 0) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [isHoveringCarousel, newsItems.length]);

    // SP Carousel auto-play effect
    useEffect(() => {
        if (isHoveringSPCarousel) return;

        const interval = setInterval(() => {
            nextSPSlide();
        }, 6000);

        return () => clearInterval(interval);
    }, [isHoveringSPCarousel]);

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                when: "beforeChildren",
            },
        },
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    const slideIn = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    const currentNews = newsItems.length > 0 ? newsItems[currentIndex] : null;
    const currentSPSlide = documentsummary[spCarouselIndex];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 antialiased">
            {/* Banner-style Carousel Section */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
            >
                <div
                    className="relative h-[600px] w-full"
                    onMouseEnter={() => setIsHoveringCarousel(true)}
                    onMouseLeave={() => setIsHoveringCarousel(false)}
                >
                    {currentNews && currentNews.avatar?.url ? (
                        <motion.img
                            key={currentIndex}
                            src={currentNews.avatar.url}
                            alt={currentNews.title || "News Image"}
                            className="h-full w-full object-cover"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-500">No Image Available</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                    <motion.div
                        key={currentIndex + "text"}
                        className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">{currentNews?.title || "No Title"}</h1>
                        <p className="mb-6 max-w-2xl text-base md:text-lg">{currentNews?.excerpt || "No excerpt available."}</p>
                    </motion.div>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white bg-opacity-20 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-opacity-40 focus:outline-none"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white bg-opacity-20 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-opacity-40 focus:outline-none"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform space-x-2">
                        {newsItems.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2.5 w-2.5 rounded-full transition-all ${
                                    index === currentIndex ? "w-6 bg-white" : "bg-white bg-opacity-50"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="relative overflow-hidden bg-red-600 text-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
            >
                <div className="px-8 py-16 text-center">
                    <motion.div
                        className="mx-auto max-w-6xl"
                        variants={fadeInUp}
                    >
                        <h2 className="mb-8 font-serif text-2xl italic leading-relaxed md:text-4xl lg:text-5xl">
                            "Together as one province, we commit to serve with integrity and unity, building a future where every community thrives in
                            progress and peace."
                        </h2>
                    </motion.div>
                </div>

                {/* Enhanced SP Carousel Section - Gradient Removed */}
                <motion.div
                    className="relative bg-gray-100 text-gray-900"
                    onMouseEnter={() => setIsHoveringSPCarousel(true)}
                    onMouseLeave={() => setIsHoveringSPCarousel(false)}
                    variants={fadeIn}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid min-h-[600px] grid-cols-1 gap-0 lg:grid-cols-2">
                            <motion.div
                                key={spCarouselIndex + "content"}
                                className="flex flex-col justify-center bg-white p-8 lg:p-12"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <div className="max-w-md">
                                    <motion.h2
                                        className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        {currentSPSlide?.title}
                                    </motion.h2>
                                    <motion.p
                                        className="mb-8 text-lg text-gray-600"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                    >
                                        {currentSPSlide?.excerpt}
                                    </motion.p>
                                </div>
                            </motion.div>
                            <motion.div
                                key={spCarouselIndex + "image"}
                                className="relative overflow-hidden"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                {currentSPSlide?.avatar?.url ? (
                                    <motion.img
                                        src={currentSPSlide.avatar.url}
                                        alt={currentSPSlide.title}
                                        className="h-full w-full object-cover"
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                        <span className="text-gray-500">No Image Available</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* SP Carousel Navigation */}
                    <button
                        onClick={prevSPSlide}
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white bg-opacity-20 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-opacity-40 focus:outline-none"
                        aria-label="Previous SP slide"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSPSlide}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white bg-opacity-20 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-opacity-40 focus:outline-none"
                        aria-label="Next SP slide"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* SP Carousel Indicators */}
                    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 transform space-x-3">
                        {documentsummary.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setSPCarouselIndex(index)}
                                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                    index === spCarouselIndex ? "w-8 bg-gray-800" : "bg-gray-400"
                                }`}
                                aria-label={`Go to SP slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mt-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp}>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Latest Bills</h2>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {isLatestBill.slice(0, 3).map((news, index) => (
                            <motion.div
                                key={news.id || news._id}
                                className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl"
                                variants={fadeInUp}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px 0px -100px 0px" }}
                            >
                                <div className="h-[200px] flex-shrink-0 bg-gray-200">
                                    <img
                                        src={news.avatar?.url || defaultCover}
                                        alt={news.title || "Default Cover"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-grow flex-col justify-between p-6">
                                    <div>
                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                                {news.category}
                                            </span>
                                            <span className="text-sm text-gray-500">{news.date}</span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900">{news.title}</h3>
                                        <p className="mb-4 text-sm text-gray-600">{news.excerpt}</p>
                                    </div>
                                    <button
                                        onClick={() => handdleVewDocument(news)}
                                        className="mt-auto text-sm font-medium text-blue-900 transition-colors duration-200 hover:text-blue-700 hover:underline"
                                    >
                                        Read Document
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>

            {/* Document Modal */}
            {selectedDocument && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedDocument(null)}
                >
                    <motion.div
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <h2 className="mb-2 text-2xl font-bold text-gray-900">{selectedDocument.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {selectedDocument.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(selectedDocument.date).toLocaleDateString()}
                                        </span>
                                        <span>{selectedDocument.fileSize}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDocument(null)}
                                    className="text-2xl font-bold text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="mb-6">
                                <img
                                    src={selectedDocument.avatar.url}
                                    alt={selectedDocument.title}
                                    className="h-64 w-full rounded-lg object-cover"
                                />
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-2 text-lg font-semibold">Summary</h3>
                                <p className="leading-relaxed text-gray-700">{selectedDocument.summary}</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-2 text-lg font-semibold">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedDocument.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                                        >
                                            <Tag className="mr-1 h-3 w-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-800">
                                    <Eye className="h-4 w-4" />
                                    Open Document
                                </button>
                                <button className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200">
                                    <Download className="h-4 w-4" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Home;
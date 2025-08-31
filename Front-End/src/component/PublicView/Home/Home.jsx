import React, { useState, useEffect, useContext } from "react";
import { ChevronLeft, ChevronRight, Folder, FileText, Calendar, User, Tag, Eye, Download, Search } from "lucide-react";
import { motion } from "framer-motion";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import defaultCover from "../../../../src/assets/billpicture.jpg";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../../src/assets/capitol.png";
import logo from "../../../../src/assets/logo-login.png";

const Home = () => {
    const { isLatestBill } = useContext(FilesDisplayContext);
    const navigate = useNavigate();
    const { pictures } = useContext(NewsDisplayContext);
    const newsItems = pictures.filter((item) => item.category === "Carousel");
    const documentsummary = pictures.filter((item) => item.category === "Documentation");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [spCarouselIndex, setSPCarouselIndex] = useState(0);
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
    const [isHoveringSPCarousel, setIsHoveringSPCarousel] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleViewDocument = (news) => {
        navigate("/expand-pdf", {
            state: {
                fileId: news._id,
                fileData: news,
                from: "/documents",
            },
        });
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex + 1) % newsItems.length));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex - 1 + newsItems.length) % newsItems.length));
    };

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

    // Skeleton Loading Components
    const CarouselSkeleton = () => (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200 shadow-xl border border-slate-200">
            <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="max-w-md mx-auto lg:mx-0">
                        <div className="h-7 w-32 bg-gray-300 rounded-full mb-6 animate-pulse"></div>
                        <div className="h-10 bg-gray-300 rounded-lg mb-4 animate-pulse"></div>
                        <div className="h-6 bg-gray-300 rounded mb-2 animate-pulse"></div>
                        <div className="h-6 bg-gray-300 rounded mb-2 animate-pulse w-3/4"></div>
                        <div className="h-6 bg-gray-300 rounded mb-8 w-1/2 animate-pulse"></div>
                    </div>
                </div>
                <div className="relative overflow-hidden bg-gray-300 animate-pulse">
                    <div className="h-full w-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );

    const BillCardSkeleton = () => (
        <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md border border-slate-200">
            <div className="h-48 flex-shrink-0 bg-gray-300 animate-pulse"></div>
            <div className="flex flex-grow flex-col justify-between p-6">
                <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-1 animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-gray-300 rounded mb-4 animate-pulse"></div>
                </div>
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse mt-4"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-slate-800 antialiased">
            {/* Hero Section */}
            <div
                className="relative flex h-screen items-center justify-center"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(30, 64, 175, 0.85), rgba(55, 48, 163, 0.8)), url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                }}
            >
          <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative z-10 text-center text-white"
>
    <motion.img
        src={logo}
        alt="Provincial Government Logo"
        className="mx-auto mb-8 h-60 w-60 opacity-95 drop-shadow-2xl"
        initial={{ opacity: 0, scale: 0.8, rotateY: 180 }} // Ibinabalik ang logo sa 180 degrees sa simula
        animate={{ opacity: 0.95, scale: 1, rotateY: 0 }} // Ibinabalik sa normal na posisyon (0 degrees)
        transition={{ duration: 1 }}
    />
    <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl drop-shadow-lg">
        Provincial Government
    </h1>
    <p className="mx-auto max-w-2xl text-xl text-blue-100 md:text-2xl drop-shadow-md">
        Serving the community with integrity and dedication
    </p>
</motion.div>
            </div>

            {/* Mission Statement Section */}
            <section className="bg-gradient-to-r from-blue-800 via-red-700 to-blue-700 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl drop-shadow-md">
                            Our Mission
                        </h2>
                        <blockquote className="text-xl italic text-blue-100 md:text-2xl drop-shadow-sm">
                            "Together as one province, we commit to serve with integrity and unity, building a future where every community thrives in progress and peace."
                        </blockquote>
                    </motion.div>
                </div>
            </section>

            {/* Featured Documents Carousel */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeInUp}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                            Featured Documents
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Important updates and announcements from the provincial government
                        </p>
                    </motion.div>

                    {isLoading || documentsummary.length === 0 ? (
                        <CarouselSkeleton />
                    ) : (
                        <motion.div
                            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 shadow-xl border border-slate-200"
                            onMouseEnter={() => setIsHoveringSPCarousel(true)}
                            onMouseLeave={() => setIsHoveringSPCarousel(false)}
                            variants={fadeIn}
                        >
                            <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-2">
                                <motion.div
                                    key={spCarouselIndex + "content"}
                                    className="flex flex-col justify-center p-8 lg:p-12"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <div className="max-w-md mx-auto lg:mx-0">
                                        <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider bg-blue-100 px-3 py-1 rounded-full">
                                            Featured
                                        </span>
                                        <h2 className="mt-4 mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                                            {currentSPSlide?.title}
                                        </h2>
                                        <p className="mb-8 text-lg text-slate-600 leading-relaxed">
                                            {currentSPSlide?.excerpt}
                                        </p>
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
                                        <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                            <span className="text-slate-500">No Image Available</span>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Carousel Navigation */}
                            <button
                                onClick={prevSPSlide}
                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white/90 backdrop-blur-sm p-3 text-blue-700 shadow-lg transition-all duration-200 hover:bg-white hover:text-blue-900 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={nextSPSlide}
                                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white/90 backdrop-blur-sm p-3 text-blue-700 shadow-lg transition-all duration-200 hover:bg-white hover:text-blue-900 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>

                            {/* Carousel Indicators */}
                            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 transform space-x-3">
                                {documentsummary.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSPCarouselIndex(index)}
                                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                            index === spCarouselIndex ? "w-6 bg-blue-600 shadow-lg" : "bg-slate-400 hover:bg-slate-500"
                                        }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Latest Bills Section */}
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp} className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Latest Bills</h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Recently proposed legislation and government documents
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {isLoading || isLatestBill.length === 0 ? (
                                // Show skeleton loading when data is loading or empty
                                Array.from({ length: 3 }).map((_, index) => (
                                    <BillCardSkeleton key={index} />
                                ))
                            ) : (
                                isLatestBill.slice(0, 3).map((news, index) => (
                                    <motion.div
                                        key={news.id || news._id}
                                        className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md border border-slate-200 transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1"
                                        variants={fadeInUp}
                                        custom={index}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px 0px -100px 0px" }}
                                    >
                                        <div className="h-48 flex-shrink-0 bg-slate-200 overflow-hidden">
                                            <img
                                                src={news.avatar?.url || defaultCover}
                                                alt={news.title || "Default Cover"}
                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex flex-grow flex-col justify-between p-6">
                                            <div>
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                    <span className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
                                                        {news.category}
                                                    </span>
                                                    <span className="text-sm text-slate-500">{news.date}</span>
                                                </div>
                                                <h3 className="mb-2 text-xl font-bold text-slate-900">{news.title}</h3>
                                                <p className="mb-4 text-slate-600 line-clamp-3">{news.excerpt}</p>
                                            </div>
                                            <button
                                                onClick={() => handleViewDocument(news)}
                                                className="mt-4 flex items-center text-blue-700 font-medium hover:text-blue-900 transition-colors group"
                                            >
                                                <FileText className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                                Read Document
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Links Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeInUp}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Government Services</h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Access our services and resources
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: FileText, title: "Documents", desc: "Official forms and publications", color: "from-blue-500 to-blue-600" },
                            { icon: Calendar, title: "Events", desc: "Government events and meetings", color: "from-green-500 to-green-600" },
                            { icon: User, title: "Officials", desc: "Government representatives", color: "from-purple-500 to-purple-600" },
                            { icon: Tag, title: "Services", desc: "Public services and programs", color: "from-orange-500 to-orange-600" }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                whileHover={{ y: -8 }}
                                className="rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 p-6 text-center shadow-md border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-blue-200"
                            >
                                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${service.color} text-white shadow-lg`}>
                                    <service.icon className="h-8 w-8" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-slate-900">{service.title}</h3>
                                <p className="text-slate-600">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
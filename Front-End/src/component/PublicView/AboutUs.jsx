import React, { useState, useEffect } from "react";
import { Clock, Users, Target, MapPin, ArrowLeft, ArrowRight, Phone, Mail, Map, ChevronRight } from "lucide-react";
import BiliranImage1 from "../../assets/historical.jpg";
import BiliranImage2 from "../../assets/ros222.jpg";
import BiliranImage3 from "../../assets/aboutpic2.jpg";
import CapitolOfficeImage from "../../assets/capitol.png";

const AboutUsPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const carouselContent = [
        {
            title: "Our History",
            icon: Clock,
            content:
                "The history of the Sangguniang Panlalawigan of Biliran is as rich as the history of the province itself. From being a sub-province of Leyte, Biliran became a full-fledged province in 1992, and with it came the establishment of the Sangguniang Panlalawigan as the primary legislative branch.",
            color: "from-blue-600 to-blue-800",
            image: BiliranImage1,
        },
        {
            title: "Our Mission and Vision",
            icon: Target,
            content: "We stand by the principles of responsible leadership, transparency, and inclusivity.",
            list: [
                "Create and implement ordinances and resolutions that truly address community needs",
                "Strengthen citizen participation in local government governance",
                "Ensure that every project and program is centered on the long-term development",
                "Protect integrity and accountability in all government actions",
            ],
            color: "from-indigo-600 to-indigo-800",
            image: BiliranImage2,
        },
        {
            title: "Our Composition",
            icon: Users,
            content: "The Sangguniang Panlalawigan is composed of:",
            list: [
                "10 elected members from the two districts (five members per district)",
                "Vice Governor as chairperson, with a vote only in case of a tie",
                "Ex officio members from the Liga ng mga Barangay and Sangguniang Kabataan",
            ],
            additionalContent: "Each member serves a three-year term, and can serve up to three consecutive terms.",
            color: "from-purple-600 to-purple-800",
            image: BiliranImage3,
        },
        {
            title: "Our Office",
            icon: MapPin,
            content:
                "Our office is located at the Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran, where we are open for communication and service to all citizens.",
            color: "from-blue-700 to-blue-900",
            image: CapitolOfficeImage,
        },
    ];

    useEffect(() => {
        if (!isHovered) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isHovered]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselContent.length) % carouselContent.length);

    return (
        <div className="min-h-screen">
            {/* Hero Section with Parallax Effect */}
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-red-700 to-blue-600">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: "40px 40px",
                        }}
                    ></div>
                </div>

                <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 md:py-24">
                    <div className="mx-auto max-w-5xl text-center">
                        {/* Label */}
                        <div className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm sm:mb-6 sm:px-6 sm:py-2">
                            <span className="text-xs font-semibold tracking-wide text-blue-200 sm:text-sm">LEGISLATIVE BRANCH</span>
                        </div>

                        {/* Heading */}
                        <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:mb-6 sm:text-5xl md:text-7xl">
                            Sangguniang
                            <br />
                            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Panlalawigan</span>
                        </h1>

                        {/* Subtitle / Description */}
                        <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-blue-100 sm:mb-12 sm:text-lg md:text-2xl">
                            The legislative heart of Biliran Province — serving with integrity, transparency, and unwavering commitment to public
                            service.
                        </p>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 120"
                        className="h-auto w-full"
                    >
                        <path
                            fill="#ffffff"
                            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                        ></path>
                    </svg>
                </div>
            </section>

            <section className="container relative z-20 mx-auto -mt-4 px-4 py-10 sm:py-16 md:py-20">
                <div className="mx-auto max-w-6xl">
                    {/* Tab Navigation */}
                    <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-8 sm:gap-3">
                        {carouselContent.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`group flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
                                        currentSlide === index
                                            ? "bg-gradient-to-r " + item.color + " scale-105 text-white shadow-lg"
                                            : "bg-white text-gray-700 shadow-md hover:bg-gray-50 hover:shadow-lg"
                                    }`}
                                >
                                    <Icon
                                        className={`h-4 w-4 transition-transform duration-300 sm:h-5 sm:w-5 ${
                                            currentSlide === index ? "rotate-12" : "group-hover:rotate-12"
                                        }`}
                                    />
                                    <span className="hidden sm:inline xs:inline">{item.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Carousel Card */}
                    <div
                        className="relative overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-5">
                            {/* Content Side */}
                            <div className="relative p-6 sm:p-8 md:col-span-3 md:p-12">
                                {carouselContent.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={index}
                                            className={`transition-all duration-500 ${
                                                index === currentSlide ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                                            }`}
                                        >
                                            {/* Header */}
                                            <div
                                                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-3 ${item.color} mb-4 text-white shadow-lg sm:mb-6`}
                                            >
                                                <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                                                <h2 className="text-lg font-bold sm:text-2xl">{item.title}</h2>
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-4 sm:space-y-6">
                                                <p className="text-sm leading-relaxed text-gray-700 sm:text-lg">{item.content}</p>

                                                {item.list && (
                                                    <ul className="space-y-3 sm:space-y-4">
                                                        {item.list.map((point, i) => (
                                                            <li
                                                                key={i}
                                                                className="group flex items-start gap-2 sm:gap-3"
                                                            >
                                                                <div
                                                                    className={`h-5 w-5 flex-shrink-0 rounded-full bg-gradient-to-r sm:h-6 sm:w-6 ${item.color} mt-0.5 flex items-center justify-center text-[10px] font-bold text-white transition-transform group-hover:scale-110 sm:mt-1 sm:text-sm`}
                                                                >
                                                                    {i + 1}
                                                                </div>
                                                                <span className="text-sm leading-relaxed text-gray-700 sm:text-base">{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {item.additionalContent && (
                                                    <p className="rounded-r border-l-4 border-blue-500 bg-blue-50 py-1.5 pl-3 text-sm italic leading-relaxed text-gray-600 sm:py-2 sm:pl-4 sm:text-base">
                                                        {item.additionalContent}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Navigation Buttons */}
                                <div className="mt-6 flex gap-2 sm:mt-8 sm:gap-3">
                                    <button
                                        onClick={prevSlide}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-md transition-all duration-300 hover:scale-110 hover:from-blue-500 hover:to-blue-600 hover:text-white hover:shadow-lg sm:h-12 sm:w-12"
                                    >
                                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-md transition-all duration-300 hover:scale-110 hover:from-blue-500 hover:to-blue-600 hover:text-white hover:shadow-lg sm:h-12 sm:w-12"
                                    >
                                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                </div>

                                {/* Progress Indicators */}
                                <div className="mt-4 flex gap-1.5 sm:mt-6 sm:gap-2">
                                    {carouselContent.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                                                index === currentSlide
                                                    ? "w-8 bg-gradient-to-r sm:w-12 " + carouselContent[currentSlide].color
                                                    : "w-1.5 bg-gray-300 hover:bg-gray-400 sm:w-2"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Image Side */}
                            <div className="relative min-h-[250px] sm:min-h-[350px] md:col-span-2 md:min-h-0">
                                {carouselContent.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-700 ${
                                            index === currentSlide ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                                        }`}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/10"></div>
                                    </div>
                                ))}

                                {/* Decorative Elements */}
                                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-white/10 blur-3xl sm:h-32 sm:w-32"></div>
                                <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-white/10 blur-3xl sm:h-40 sm:w-40"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-12 xs:mb-4 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                            Get in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            We welcome your inquiries, suggestions, and partnership in building a better Biliran.
                        </p>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid gap-8 xs:gap-2 xs-max:gap4 md:grid-cols-2">
                        {/* Map Card */}
                        <div className="hover:shadow-3xl group overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform duration-300">
                            <div className="relative h-96">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.8008751617217!2d124.4071681108963!3d11.56612798858736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a78ca4a4ed2563%3A0xdf64c9ca39745dc9!2sBiliran%20Provincial%20Capitol-Building!5e0!3m2!1sen!2sph!4v1756898261063!5m2!1sen!2sph"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Biliran Provincial Capitol"
                                    className="transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-6 text-white shadow-lg">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                        backgroundSize: "40px 40px",
                                    }}
                                ></div>
                            </div>

                            {/* Foreground Content */}
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-lg font-bold">Contact Information</h3>
                                <p className="text-xs text-blue-100 opacity-90">Reach out to us for inquiries.</p>

                                <div className="space-y-4">
                                    {[
                                        { icon: Map, label: "Address", value: "Biliran Provincial Capitol, Naval, Biliran" },
                                        { icon: Phone, label: "Phone", value: "(053) 500-0000" },
                                        { icon: Mail, label: "Email", value: "info@biliransp.gov.ph" },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-white/15">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="-mt-0.5">
                                                <div className="text-[11px] font-medium text-blue-200">{item.label}</div>
                                                <div className="text-sm leading-tight">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;

import React, { useState, useEffect, useRef } from "react";
import { Clock, Users, Target, MapPin, ArrowLeft, ArrowRight, Phone, Mail, Map } from "lucide-react";
import { motion, useInView } from "framer-motion";
import BiliranImage1 from "../../assets/aboutpic1.jpg";
import BiliranImage2 from "../../assets/aboutpic3.jpeg";
import BiliranImage3 from "../../assets/aboutpic2.jpg";
import CapitolOfficeImage from "../../assets/capitol.png";

const AboutUsPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroRef = useRef(null);
    const introRef = useRef(null);
    const ctaRef = useRef(null);

    const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
    const introInView = useInView(introRef, { once: true, margin: "-50px" });
    const ctaInView = useInView(ctaRef, { once: true, margin: "-50px" });

    const carouselContent = [
        {
            title: "Our History",
            icon: (
                <Clock
                    className="text-blue-700"
                    size={28}
                />
            ),
            content:
                "The history of the Sangguniang Panlalawigan of Biliran is as rich as the history of the province itself. From being a sub-province of Leyte, Biliran became a full-fledged province in 1992, and with it came the establishment of the Sangguniang Panlalawigan as the primary legislative branch. Over time, the Sangguniang Panlalawigan has been the center of educational, health, infrastructure, and livelihood programs, and continues to serve the people with integrity and accountability.",
            image: BiliranImage1,
        },
        {
            title: "Our Mission and Vision",
            icon: (
                <Target
                    className="text-blue-700"
                    size={28}
                />
            ),
            content: "We stand by the principles of responsible leadership, transparency, and inclusivity. Our goals are:",
            list: [
                "Create and implement ordinances and resolutions that truly address community needs",
                "Strengthen citizen participation in local government governance",
                "Ensure that every project and program is centered on the long-term development of the province",
                "Protect integrity and accountability in all government actions",
            ],
            image: BiliranImage2,
        },
        {
            title: "Our Composition",
            icon: (
                <Users
                    className="text-blue-700"
                    size={28}
                />
            ),
            content: "The Sangguniang Panlalawigan is composed of:",
            list: [
                "10 elected members from the two districts (five members per district)",
                "Vice Governor as chairperson, with a vote only in case of a tie",
                "Ex officio members from the Liga ng mga Barangay and Sangguniang Kabataan",
            ],
            additionalContent:
                "Each member is elected through plurality-at-large voting, serves a three-year term, and can serve up to three consecutive terms.",
            image: BiliranImage3,
        },
        {
            title: "Our Office",
            icon: (
                <MapPin
                    className="text-blue-700"
                    size={28}
                />
            ),
            content:
                "Our office is located at the Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran, where we are open for communication and service to all citizens. With every ordinance, project, and program, our goal is to ensure that Every Voice in Biliran is Heard and Valued.",
            image: CapitolOfficeImage,
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselContent.length) % carouselContent.length);

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    };

    const fadeSlide = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-50">
            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={fadeIn}
                className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 px-4 py-28 text-white 2xs:py-12 xs:py-12 xs-max:py-12"
            >
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="2xs-max:mb-2 2xs-max:text-lg mb-5 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl 2xs:text-2xl xs:mb-2 xs:text-2xl xs-max:mb-2 xs-max:text-lg"
                    >
                        About the Sangguniang Panlalawigan
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="2xs-max:text-sm mx-auto max-w-2xl text-lg leading-relaxed opacity-90 md:text-xl 2xs:text-sm xs:text-sm xs-max:text-sm"
                    >
                        The legislative heart of Biliran Province — serving with integrity, transparency, and unwavering commitment to public service.
                    </motion.p>
                </div>
            </motion.section>

            {/* Content + Contact */}
            <div className="container mx-auto mt-10 xs:mt-2 xs-max:mt-2 2xs:mt-2 max-w-7xl px-4 pb-20 sm:pb-10 md:pb-20 2xs:pb-2 xs:pb-4 xs-max:pb-2">
                {/* Carousel Section */}
                <motion.div
                    className="mb-4 2xs:mb-2 2xs:mt-4 xs:mb-2 xs:mt-4 xs-max:mb-2 xs-max:mt-4"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Content Panel */}
                            <div className="relative flex min-h-[520px] flex-col p-6 lg:p-10 2xs:min-h-[460px] xs:min-h-[500px] xs:p-5 xs-max:min-h-[500px]">
                                {carouselContent.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial="hidden"
                                        animate={index === currentSlide ? "visible" : "hidden"}
                                        variants={fadeSlide}
                                        className="absolute inset-0 p-6 lg:p-10 xs:p-5"
                                    >
                                        {/* Title with Icon */}
                                        <div className="mb-6 flex items-center gap-3 xs:gap-2">
                                            {item.icon}
                                            <h2 className="font-serif text-2xl font-bold text-gray-800 2xs:text-xl xs:text-xl xs-max:text-lg">
                                                {item.title}
                                            </h2>
                                        </div>

                                        {/* Content text */}
                                        <p className="mb-5 text-base leading-relaxed text-gray-700 2xs:text-[11px] xs:text-sm xs-max:text-xs">
                                            {item.content}
                                        </p>

                                        {/* List */}
                                        {item.list && (
                                            <ul className="mb-5 space-y-2 pl-1 text-base text-gray-700 2xs:text-[11px] xs:text-sm xs-max:text-xs">
                                                {item.list.map((point, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start"
                                                    >
                                                        <span className="mr-2 mt-1 text-blue-600">•</span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Additional content */}
                                        {item.additionalContent && (
                                            <p className="text-base leading-relaxed text-gray-700 2xs:text-[11px] xs:text-sm xs-max:text-xs">
                                                {item.additionalContent}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Image Panel */}
                            <div className="relative h-64 lg:h-auto lg:min-h-[520px] 2xs:h-60 xs:h-72 xs-max:h-56">
                                {carouselContent.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: index === currentSlide ? 1 : 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute inset-0"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    ref={ctaRef}
                    initial="hidden"
                    animate={ctaInView ? "visible" : "hidden"}
                    variants={fadeIn}
                    className="overflow-hidden rounded-2xl border border-gray-100 shadow-xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Map */}
                        <div className="h-60 md:h-auto 2xs:h-48 xs:h-56 xs-max:h-56">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.8008751617217!2d124.4071681108963!3d11.56612798858736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a78ca4a4ed2563%3A0xdf64c9ca39745dc9!2sBiliran%20Provincial%20Capitol-Building!5e0!3m2!1sen!2sph!4v1756898261063!5m2!1sen!2sph"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Biliran Provincial Capitol Building"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white xs:p-4">
                            <h2 className="mb-5 font-serif text-3xl font-bold 2xs:mb-1 2xs:text-[17px] xs:mb-1 xs:text-[17px] xs-max:mb-1 xs-max:text-[17px]">
                                Contact the Office
                            </h2>
                            <p className="mb-7 text-lg leading-relaxed opacity-90 2xs:mb-1 2xs:text-[12px] xs:mb-1 xs:text-[12px] xs-max:mb-1 xs-max:text-[12px]">
                                We welcome your inquiries, suggestions, and partnership in building a better Biliran.
                            </p>

                            <div className="space-y-5 2xs:space-y-0 xs:space-y-0 xs-max:space-y-0">
                                {[
                                    {
                                        icon: <Map size={22} />,
                                        label: "Address",
                                        value: "Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran",
                                    },
                                    { icon: <Phone size={22} />, label: "Phone", value: "(053) 500-0000" },
                                    { icon: <Mail size={22} />, label: "Email", value: "info@biliransp.gov.ph" },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-4"
                                    >
                                        <div className="mt-1 text-blue-200">{item.icon}</div>
                                        <div>
                                            <h3 className="text-lg font-semibold 2xs:text-[12px] xs:text-[12px] xs-max:text-[12px]">{item.label}</h3>
                                            <p className="opacity-90 2xs:text-[12px] xs:text-[12px] xs-max:text-[12px]">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutUsPage;

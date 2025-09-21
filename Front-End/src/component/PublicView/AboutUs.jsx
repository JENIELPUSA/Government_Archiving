import React, { useState, useEffect, useRef } from "react";
import { Clock, Users, Target, MapPin, ArrowLeft, ArrowRight, Phone, Mail, Map } from "lucide-react";
import { motion, useInView } from "framer-motion";
import BiliranImage1 from "../../assets/aboutpic1.jpg";
import BiliranImage2 from "../../assets/aboutpic3.jpeg";
import BiliranImage3 from "../../assets/aboutpic2.jpg";
import CapitolOfficeImage from "../../assets/CapitolOfficeImage.png";

const AboutUsPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Refs for scroll animations
    const heroRef = useRef(null);
    const introRef = useRef(null);
    const ctaRef = useRef(null);

    // Check if elements are in view
    const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
    const introInView = useInView(introRef, { once: true, margin: "-50px" });
    const ctaInView = useInView(ctaRef, { once: true, margin: "-50px" });

    // Content for carousel slides
    const carouselContent = [
        {
            title: "📜 Our History",
            icon: (
                <Clock
                    className="mr-2 text-blue-600"
                    size={24}
                />
            ),
            content:
                "The history of the Sangguniang Panlalawigan of Biliran is as rich as the history of the province itself. From being a sub-province of Leyte, Biliran became a full-fledged province in 1992, and with it came the establishment of the Sangguniang Panlalawigan as the primary legislative branch. Over time, the Sangguniang Panlalawigan has been the center of educational, health, infrastructure, and livelihood programs, and continues to serve the people with integrity and accountability.",
            image: BiliranImage1,
        },
        {
            title: "🎯 Our Mission and Vision",
            icon: (
                <Target
                    className="mr-2 text-blue-600"
                    size={24}
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
            title: "🗳️ Our Composition",
            icon: (
                <Users
                    className="mr-2 text-blue-600"
                    size={24}
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
            title: "🏢 Our Office",
            icon: (
                <MapPin
                    className="mr-2 text-blue-600"
                    size={24}
                />
            ),
            content:
                "Our office is located at the Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran, where we are open for communication and service to all citizens. With every ordinance, project, and program, our goal is to ensure that Every Voice in Biliran is Heard and Valued.",
            image: CapitolOfficeImage,
        },
    ];

    // Auto slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Navigate to next/previous slide
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselContent.length) % carouselContent.length);
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
                variants={fadeInUp}
                className="relative bg-gradient-to-r from-blue-600 via-red-700 to-blue-600 py-20 xs:py-6 xs-max:py-8 text-white"
            >
                <div className="container mx-auto max-w-5xl xs:px-[16px] xs-max:px-[20px] xm:px-[20px]">
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl xs:text-xl xs-max:text-2xl">🏛️ About Us</h1>
                    <p className="max-w-3xl text-xl xs:text-[14px] xs:leading-5 xs-max:text-sm xs-max:leading-5">
                        The Sangguniang Panlalawigan of Biliran is the heart of legislative governance in the province.
                    </p>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="container mx-auto -mt-16 max-w-8xl xs:p-12 xs-max:p-13 lg:px-16  xs:px-0 xs-max:px-0">
                {/* Intro Card */}
                <motion.div
                    ref={introRef}
                    initial="hidden"
                    animate={introInView ? "visible" : "hidden"}
                    variants={fadeInUp}
                    className="mb-8 xs:mb-2 rounded-xl bg-white bg-opacity-90 p-6 shadow-lg backdrop-blur-sm"
                >
                    <p className="text-lg text-gray-700 xm:text-[12px] xm:leading-5 xs:text-[10px] xs:leading-4 xs-max:text-[12px] xs-max:leading-4 lg-custom:text-lg">
                        From ordinances to policies, we drive initiatives that promote development, justice, and the common good of the people.
                        Composed of elected representatives from the two districts, with the Vice Governor as chairperson, our body ensures orderly
                        and effective governance of all provincial matters.
                    </p>
                </motion.div>

                {/* Combined Carousel Section */}
                <div className="mb-8 xs:mb-2 overflow-hidden rounded-xl bg-white shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Content Side */}
                        <div className="relative min-h-[500px] xs-max:min-h-[400px] xs:min-h-[370px]  p-8">
                            {carouselContent.map((item, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 p-8 transition-opacity duration-700 ${
                                        index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
                                    }`}
                                >
                                    <div className="mb-6 flex items-center xs:h-2">
                                        {item.icon}
                                        <h2 className="text-2xl font-bold text-gray-800 xs:text-[14px] lg-custom:text-2xl xs-max:text-lg">{item.title}</h2>
                                    </div>

                                    <div className="mb-4 text-gray-700 xm:text-[12px] xm:leading-5 xs:text-[12px] xs:leading-5 lg-custom:text-lg xs-max:text-[12px]">{item.content}</div>

                                    {item.list && (
                                        <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700 xm:text-[12px] xm:leading-5 xs:text-[12px] lg-custom:text-lg xs-max:text-[12px]">
                                            {item.list.map((listItem, i) => (
                                                <li key={i}>{listItem}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {item.additionalContent && <p className="text-gray-700 xm:text-[12px] xm:leading-5 xs:text-[12px] xs-max:text-[12px] lg-custom:text-lg">{item.additionalContent}</p>}
                                </div>
                            ))}

                            {/* Navigation Arrows */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                                <button
                                    onClick={prevSlide}
                                    className="rounded-full bg-blue-600 p-2 text-white transition-all hover:bg-blue-700"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="rounded-full bg-blue-600 p-2 text-white transition-all hover:bg-blue-700"
                                >
                                    <ArrowRight size={24} />
                                </button>
                            </div>

                            {/* Dot Indicators */}
                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                                {carouselContent.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-3 w-3 rounded-full transition-all ${index === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Image Side */}
                        <div className="relative h-96 lg:h-auto">
                            {carouselContent.map((item, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${
                                        index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
                                    }`}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Call to Action Section */}
                <motion.div
                    ref={ctaRef}
                    initial="hidden"
                    animate={ctaInView ? "visible" : "hidden"}
                    variants={fadeInUp}
                    className="overflow-hidden rounded-xl shadow-lg"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Map */}
                        <div className="h-80 md:h-auto">
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
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
                            <h2 className="mb-4 text-3xl font-bold xs:text-lg">Contact Us</h2>
                            <p className="mb-6 text-xl xs:text-sm">
                                We are here to listen and serve you. We invite you to collaborate for the progress of Biliran.
                            </p>

                            <div className="mb-2 space-y-4">
                                <div className="flex items-start">
                                    <Map
                                        className="mr-3 mt-1 flex-shrink-0"
                                        size={20}
                                    />
                                    <div>
                                        <h3 className="font-semibold xs:text-[12px]">Address</h3>
                                        <p className="xs:text-[10px]">Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Phone
                                        className="mr-3 mt-1 flex-shrink-0"
                                        size={20}
                                    />
                                    <div>
                                        <h3 className="font-semibold xs:text-[12px]">Phone</h3>
                                        <p className="xs:text-[10px]">(053) 500-0000</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Mail
                                        className="mr-3 mt-1 flex-shrink-0"
                                        size={20}
                                    />
                                    <div>
                                        <h3 className="font-semibold xs:text-[12px]">Email</h3>
                                        <p className="xs:text-[10px]">info@biliransp.gov.ph</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutUsPage;

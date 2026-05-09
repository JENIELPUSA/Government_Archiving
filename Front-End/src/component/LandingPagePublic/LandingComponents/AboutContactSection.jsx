import React from "react";
import { FaFacebook, FaYoutube, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import background from "../../../assets/Bacground.jpg";
import Arta from "../../../assets/Arta.jpg";
import GlobalHotline from "../../../assets/globalhotline.jfif";

const AboutContactSection = () => {
    // Contact information data
    const contactInfo = {
        address: {
            street: "Capitol Compound, National Highway",
            barangay: "Brgy. Calumpang, Naval, Biliran"
        },
        telephone: "500 0232",
        email: [
            "plgu.sp.emielorrianneho@gmail.com",
            "Spsecretarybiliran2019@gmail.com"
        ],
        socialMedia: {
            facebook: "https://web.facebook.com/spbiliran2019",
            youtube: "#",
            email: "mailto:biliranofficial@gmail.com"
        }
    };

    const statistics = [
        { value: 8, label: "Municipalities", suffix: "" },
        { value: 184095, label: "Population", suffix: "," },
        { value: 1992, label: "Founded", suffix: null, useGrouping: false }
    ];

    return (
        <section id="about" className="relative min-h-full overflow-hidden py-20">
            {/* Background with grayscale filter */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${background})`,
                    filter: "grayscale(100%) brightness(0.8)",
                    zIndex: 1,
                }}
                aria-label="Background image"
            />

            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black/40 z-[2]" />

            {/* Main Content */}
            <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
                    
                    {/* About Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
                    >
                        <h2 className="mb-6 text-3xl md:text-4xl font-bold text-white">
                            About Biliran Province
                        </h2>

                        <p className="mb-6 text-lg leading-relaxed text-white/90">
                            Biliran is one of the country's smallest and newest provinces. 
                            Formerly a sub-province of Leyte, it became an independent 
                            province in 1992. Known for its rich natural resources, warm 
                            hospitality, and untouched beauty, Biliran offers a unique 
                            blend of adventure and tranquility.
                        </p>

                        <p className="mb-8 text-lg leading-relaxed text-white/90">
                            The Provincial Government is dedicated to sustainable development, 
                            ensuring that progress goes hand in hand with environmental 
                            preservation and social equity.
                        </p>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {statistics.map((stat, index) => (
                                <div 
                                    key={index}
                                    className="rounded-lg border border-white/30 bg-white/20 p-4 text-center backdrop-blur-sm"
                                >
                                    <h4 className="mb-1 text-3xl font-bold text-white">
                                        <CountUp
                                            end={stat.value}
                                            duration={2}
                                            separator={stat.suffix}
                                            useGrouping={stat.useGrouping ?? true}
                                        />
                                    </h4>
                                    <span className="text-sm text-white/80">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 rounded-2xl border border-white/20 bg-blue-900/80 p-8 text-white shadow-xl backdrop-blur-md"
                    >
                        {/* ARTA Image */}
                        <div className="w-full h-40 overflow-hidden rounded-2xl">
                            <img
                                src={Arta}
                                alt="Anti-Red Tape Act (ARTA) logo"
                                className="w-full h-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                                loading="lazy"
                            />
                        </div>

                        <h3 className="mb-4 text-2xl font-bold">Contact Information</h3>

                        <div className="space-y-4">
                            {/* Address */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold min-w-[85px]">Address:</span>
                                <p className="text-sm">
                                    {contactInfo.address.street}
                                    <br />
                                    {contactInfo.address.barangay}
                                </p>
                            </div>

                            {/* Telephone */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold min-w-[85px]">Telephone:</span>
                                <p className="text-sm">{contactInfo.telephone}</p>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold min-w-[85px]">Email:</span>
                                <p className="text-sm">
                                    {contactInfo.email.join(", ")}
                                </p>
                            </div>

                            {/* Social Media Icons */}
                            <div className="flex justify-center gap-6 pt-4">
                                <a
                                    href={contactInfo.socialMedia.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 transition hover:bg-blue-600"
                                    aria-label="Facebook"
                                >
                                    <FaFacebook size={20} />
                                </a>

                                <a
                                    href={contactInfo.socialMedia.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 transition hover:bg-red-600"
                                    aria-label="YouTube"
                                >
                                    <FaYoutube size={20} />
                                </a>

                                <a
                                    href={contactInfo.socialMedia.email}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 transition hover:bg-blue-500"
                                    aria-label="Email"
                                >
                                    <FaEnvelope size={20} />
                                </a>
                            </div>

                            {/* Hotline Image */}
                            <div className="w-full h-40 overflow-hidden rounded-2xl">
                                <img
                                    src={GlobalHotline}
                                    alt="Global hotline information"
                                    className="w-full h-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutContactSection;

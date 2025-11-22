import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import background from "../../../assets/Bacground.jpg";
import CountUp from "react-countup";
import Arta from "../../../assets/Arta.jpg";
import GlobalHotline from "../../../assets/globalhotline.jfif"

const AboutContactSection = () => {
    return (
        <section
            id="about"
            className="relative min-h-full overflow-hidden py-20"
        >
            {/* GRAYSCALE BACKGROUND */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${background})`,
                    filter: "grayscale(100%) brightness(0.8)",
                    zIndex: 1,
                }}
            ></div>

            {/* OVERLAY FOR BETTER READABILITY */}
            <div className="z-2 absolute inset-0 bg-black/40"></div>

            {/* CONTENT */}
            <div className="relative z-10 mx-auto w-full max-w-screen-xl px-4">
                <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                    {/* About Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
                    >
                        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">About Biliran Province</h2>

                        <p className="mb-6 text-lg leading-relaxed text-white/90">
                            Biliran is one of the country's smallest and newest provinces. Formerly a sub-province of Leyte, it became an independent
                            province in 1992. Known for its rich natural resources, warm hospitality, and untouched beauty, Biliran offers a unique
                            blend of adventure and tranquility.
                        </p>

                        <p className="mb-8 text-lg leading-relaxed text-white/90">
                            The Provincial Government is dedicated to sustainable development, ensuring that progress goes hand in hand with
                            environmental preservation and social equity.
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/30 bg-white/20 p-4 text-center backdrop-blur-sm">
                                <h4 className="mb-1 text-3xl font-bold text-white">
                                    <CountUp
                                        end={8}
                                        duration={2}
                                    />
                                </h4>
                                <span className="text-sm text-white/80">Municipalities</span>
                            </div>

                            <div className="rounded-lg border border-white/30 bg-white/20 p-4 text-center backdrop-blur-sm">
                                <h4 className="mb-1 text-3xl font-bold text-white">
                                    <CountUp
                                        end={170000}
                                        duration={2}
                                        separator=","
                                        suffix="+"
                                    />
                                </h4>
                                <span className="text-sm text-white/80">Population</span>
                            </div>

                            <div className="rounded-lg border border-white/30 bg-white/20 p-4 text-center backdrop-blur-sm">
                                <h4 className="mb-1 text-3xl font-bold text-white">
                                    <CountUp
                                        end={1992}
                                        duration={2}
                                    />
                                </h4>
                                <span className="text-sm text-white/80">Founded</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 rounded-2xl border border-white/20 bg-blue-900/80 p-8 text-white shadow-xl backdrop-blur-md"
                    >
                        {/* Arta Image */}
                        <div className="h-40 w-full overflow-hidden rounded-2xl">
                            <img
                                src={Arta}
                                alt="Arta"
                                className="h-full w-full object-cover grayscale filter transition-all duration-500 hover:grayscale-0"
                            />
                        </div>

                        <h3 className="mb-4 text-2xl font-bold">Contact Information</h3>

                        <div className="space-y-4">
                            {/* Address */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold">Address:</span>
                                <p>123 Main Street, Brgy. Poblacion, Biliran Province</p>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold">Email:</span>
                                <p>info@biliran.gov.ph</p>
                            </div>

                            {/* Gmail */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold">Gmail:</span>
                                <p>biliranofficial@gmail.com</p>
                            </div>
                             {/* Gmail */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold">Contact Number:</span>
                                <p>biliranofficial@gmail.com</p>
                            </div>

                            {/* Facebook */}
                            <div className="flex items-start gap-4">
                                <span className="font-semibold">Facebook:</span>
                                <p>facebook.com/BiliranOfficial</p>
                            </div>
                            {/* Arta Image */}
                        <div className="h-40 w-full overflow-hidden rounded-2xl">
                            <img
                                src={GlobalHotline}
                                alt="Arta"
                                className="h-full w-full object-cover grayscale filter transition-all duration-500 hover:grayscale-0"
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

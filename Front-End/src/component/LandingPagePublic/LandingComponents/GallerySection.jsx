import React from "react";
import { motion } from "framer-motion";
import UlanUlan from "../../../assets/ulan-ulan.jpg";
import tumalistis from "../../../assets/tumalistis.jpg";
import tinago from "../../../assets/Tinago.JPG";
import sambawan from "../../../assets/sambawan.jpg";
import gallery2 from "../../../assets/gallery2.jpg";
import gallery1 from "../../../assets/gallery1.jpg";
import gallery6 from "../../../assets/gallery6.webp";
import gallery5 from "../../../assets/gallery5.jfif";
const GallerySection = () => {
    const images = [
        { src: UlanUlan, alt: "Ulan Ulan Falls", span: "col-span-1 md:col-span-2 row-span-2" },
        { src: tumalistis, alt: "Tumalistis", span: "col-span-1" },
        { src: tinago, alt: "Falls", span: "col-span-1" },
        { src: sambawan, alt: "Island Hopping", span: "col-span-1 md:col-span-2" },
        { src: gallery1, alt: "Local Culture", span: "col-span-1" },
        { src: gallery2, alt: "Local Culture", span: "col-span-1" },
        { src: gallery6, alt: "Local Culture", span: "col-span-1" },
        { src: gallery5, alt: "Local Culture", span: "col-span-1" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <section
            id="gallery"
            className="min-h-full bg-blue-950 py-20 text-white"
        >
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Tourism & Gallery</h2>
                    <p className="mx-auto max-w-2xl text-blue-200">
                        Explore the breathtaking beauty of Biliran Province. From majestic waterfalls to pristine white sand beaches.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mb-12 grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-4"
                >
                    {images.map((img, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className={`group relative overflow-hidden rounded-xl ${img.span} border-2 border-blue-800`}
                        >
                            <img
                                src={img.src}
                                alt={img.alt}
                                className="h-full w-full transform object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <h3 className="text-xl font-bold text-white">{img.alt}</h3>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="text-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open("https://tourism.biliranisland.com/island-attractions", "_blank")}
                        className="rounded-full bg-red-600 px-8 py-3 font-bold text-white shadow-lg shadow-red-600/30 transition-colors hover:bg-red-700"
                    >
                        Explore More Destinations
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

export default GallerySection;

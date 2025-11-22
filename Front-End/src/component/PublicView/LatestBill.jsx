import React, { useContext, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { FileText } from "lucide-react"; // icon for Resolution

// Skeleton Loader
const BillCardSkeleton = () => (
  <div className="flex w-full items-start gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md">
    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-300"></div>
    <div className="flex flex-grow flex-col justify-between">
      <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-300"></div>
      <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-300"></div>
      <div className="h-5 w-32 animate-pulse rounded bg-gray-300"></div>
    </div>
  </div>
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
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

const LatestBills = ({ onFileView, isLoading }) => {
  const { isLatestBill } = useContext(FilesDisplayContext);
  const billsRef = useRef(null);
  const billsInView = useInView(billsRef, { once: true, margin: "-10% 0px" });
return (
  <section ref={billsRef} className="container mx-auto">
    <motion.div
      initial="hidden"
      animate={billsInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center mb-2">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-blue-800">
          <span className="h-1 w-10 bg-red-600 rounded-full"></span>
          Transparency
          <span className="h-1 w-10 bg-yellow-400 rounded-full"></span>
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Empowering citizens through accessible and transparent governance.
        </p>
      </motion.div>

      {/* Bills List */}
      <div className="flex flex-col gap-3">
        {isLoading || isLatestBill.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
              <BillCardSkeleton key={index} />
            ))
          : isLatestBill.slice(0, 3).map((news, index) => {
              // Extract category and first letter
              const category = news.category || "";
              const firstLetter = category.charAt(0).toUpperCase();

              return (
                <motion.div
                  key={news.id || news._id}
                  className="relative overflow-visible rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 via-white to-red-50 p-5 shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg"
                  variants={fadeInUp}
                  custom={index}
                >
                  {/* Colored top border accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 via-yellow-400 to-red-600"></div>

                  {/* Category Watermark for Resolution or Ordinance */}
                  {["Resolution", "Ordinance"].includes(category) && (
                    <div className="absolute top-2 left-2 transform -rotate-6 z-10">
                      <span className="text-5xl md:text-6xl font-extrabold text-blue-800 opacity-10 drop-shadow-lg leading-none">
                        {category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <div className="flex items-start justify-between flex-wrap mt-6 relative z-20">
                    <h3 className="font-extrabold uppercase text-blue-800 md:text-lg text-sm">
                      {news.title}
                    </h3>
                  </div>

                  {/* Summary */}
                  <p className="mt-3 text-sm leading-relaxed text-gray-700">
                    {news.summary}
                  </p>

                  {/* Read More */}
                  <button
                    onClick={() => onFileView(news._id, news)}
                    className="mt-3 text-sm font-semibold text-blue-700 hover:text-red-600 transition"
                  >
                    Read more…
                  </button>
                </motion.div>
              );
            })}
      </div>
    </motion.div>
  </section>
);


};

export default LatestBills;
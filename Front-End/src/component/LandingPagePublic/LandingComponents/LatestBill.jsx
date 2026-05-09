import React, { useContext, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
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
        <section
            ref={billsRef}
            className="container mx-auto"
        >
            {/* Bills List */}
            <div className="flex flex-col gap-3">
                {isLoading || isLatestBill.length === 0
                    ? Array.from({ length: 5 }).map((_, index) => <BillCardSkeleton key={index} />)
                    : isLatestBill.slice(0, 5).map((news) => {
                          const category = news.category || "";

                          return (
                              <div
                                  key={news.id || news._id}
                                  className="relative overflow-visible rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 via-white to-red-50 p-3 shadow-md transition-transform hover:scale-[1.01] hover:shadow-lg"
                              >
                                  {/* Colored top border accent */}
                                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-700 via-yellow-400 to-red-600"></div>

                                  {/* Category Watermark */}
                                  {["Resolution", "Ordinance"].includes(category) && (
                                      <div className="absolute left-2 top-2 z-10 -rotate-6 transform">
                                          <span className="text-4xl font-extrabold leading-none text-blue-800 opacity-10 drop-shadow-lg md:text-5xl">
                                              {category}
                                          </span>
                                      </div>
                                  )}

                                  {/* Title */}
                                  <div className="relative z-20 mt-4 flex flex-wrap items-start justify-between">
                                      <h3 className="text-xs font-extrabold uppercase text-blue-800 md:text-sm">{news.title}</h3>
                                  </div>

                                  {/* Summary */}
                                  <p className="mt-2 text-xs leading-snug text-gray-700">{news.summary}</p>

                                  {/* Read More */}
                                  <button
                                      onClick={() => onFileView(news._id, news)}
                                      className="mt-2 text-xs font-semibold text-blue-700 transition hover:text-red-600"
                                  >
                                      Read more…
                                  </button>
                              </div>
                          );
                      })}
            </div>
        </section>
    );
};

export default LatestBills;

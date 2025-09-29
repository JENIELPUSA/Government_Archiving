import React, { useContext, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { FileText } from "lucide-react";

// Skeletons
const BillCardSkeleton = () => (
    <div className="flex w-full items-start gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-300"></div>
        <div className="flex flex-grow flex-col justify-between">
            <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-300"></div>
            <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-300"></div>
            <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-300"></div>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-300"></div>
        </div>
    </div>
);

// Animation variants (you can keep these in a separate variants file if you have many)
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
            className="container mx-auto lg:mt-0 2xs:mt-4"
        >
            <motion.div
                initial="hidden"
                animate={billsInView ? "visible" : "hidden"}
                variants={staggerContainer}
            >
                <motion.div
                    variants={fadeInUp}
                    className="text-center"
                >
                    <h1 className="mb-6 flex items-center text-2xl font-bold text-blue-800 md:text-3xl">
                        <span className="flex-1 border-b border-gray-300"></span>
                        <span className="px-4">Transparency</span>
                        <span className="flex-1 border-b border-gray-300"></span>
                    </h1>
                </motion.div>

                <div className="flex flex-col gap-2">
                    {isLoading || isLatestBill.length === 0
                        ? Array.from({ length: 3 }).map((_, index) => <BillCardSkeleton key={index} />)
                        : isLatestBill.slice(0, 3).map((bill, index) => (
                              <motion.div
                                  key={bill.id || bill._id}
                                  className="rounded border border-gray-300 bg-white p-4 shadow-sm transition duration-200 hover:shadow-md"
                                  variants={fadeInUp}
                                  custom={index}
                                  initial="hidden"
                                  animate={billsInView ? "visible" : "hidden"}
                              >
                                  {/* Title */}
                                  <h3 className="mb-3 font-bold uppercase text-blue-700 lg:text-lg 2xs:text-[10px] xs:text-[10px] xs:leading-5">
                                      {bill.title}
                                  </h3>

                                  {/* Summary */}
                                  <p className="mb-4 text-sm leading-relaxed text-gray-600 xs:text-[9px] xs:leading-5">{bill.summary}</p>

                                  {/* Read more */}
                                  <button
                                      onClick={() => onFileView(bill._id, bill)}
                                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline lg:text-sm 2xs:text-[10px] xs:text-[12px]"
                                  >
                                      read more…
                                  </button>
                              </motion.div>
                          ))}
                </div>
            </motion.div>
        </section>
    );
};

export default LatestBills;

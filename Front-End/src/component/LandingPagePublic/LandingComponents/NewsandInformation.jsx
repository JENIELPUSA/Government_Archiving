import React, { useContext, useState } from "react";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import BannerImage from "../LandingComponents/BannerImage";
import Breadcrumb from "../LandingComponents/Breadcrumb";

const NewsandInformation = ({ onViewLatestNews, onBack }) => {
    const { pictures, loading } = useContext(NewsDisplayContext);
    const [currentPage, setCurrentPage] = useState(1);
    const newsPerPage = 6;
    const indexOfLastNews = currentPage * newsPerPage;
    const indexOfFirstNews = indexOfLastNews - newsPerPage;
    const currentNews = pictures.slice(indexOfFirstNews, indexOfLastNews);
    const totalPages = Math.ceil(pictures.length / newsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const truncateExcerpt = (text, maxLength) => (text.length > maxLength ? text.substring(0, maxLength) + "..." : text);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    if (loading) {
        return (
            <div className="p-6">
                {Array.from({ length: newsPerPage }).map((_, idx) => (
                    <div
                        key={idx}
                        className="mb-4 h-48 animate-pulse rounded bg-gray-300"
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <BannerImage selection={"News & Information"} />
            <Breadcrumb
                position={"News & Information"}
                onBack={onBack}
            />
            <div className="mx-auto max-w-5xl p-8">
                <h1 className="max-xs:text-2xl mb-6 text-3xl font-bold  2xs:mb-1 2xs:text-lg xs-max:mb-1 xs-max:text-lg">News and Information</h1>
                {currentNews.map((news) => (
                    <div
                        key={news.id}
                        className="flex flex-col border-b py-4 last:border-b-0 md:flex-row"
                    >
                        <div className="mb-4 md:mb-0 md:mr-4 md:w-1/3 xs:mb-2">
                            <img
                                src={news.avatar.url}
                                alt={news.title || "News image"}
                                className="h-48 w-full rounded object-cover"
                            />
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="mb-2 text-xl font-bold xs:text-sm 2xs:text-sm xs-max:text-sm">{news.title}</h2>
                            <p className="mb-2 text-gray-600 xs:text-[12px] 2xs:text-[12px] xs-max:text-[12px]">{truncateExcerpt(news.excerpt, 150)}</p>
                            <button
                                onClick={() => onViewLatestNews(news)}
                                className="font-medium text-blue-600 hover:text-blue-800 xs:text-[12px] 2xs:text-[12px] xs-max:text-[12px]"
                            >
                                Read more
                            </button>
                        </div>
                    </div>
                ))}

                {/* Pagination */}
                <div className="mt-4 flex justify-center space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded border px-3 py-1 disabled:opacity-50 xs:text-[12px] 2xs:text-[12px] xs-max:text-[12px]"
                    >
                        Prev
                    </button>
                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`xs:text-[12px] 2xs:text-[12px] xs-max:text-[12px] rounded border px-3 py-1 ${currentPage === number ? "bg-blue-600 text-white" : "bg-white" }`}
                        >
                            {number}
                        </button>
                    ))}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded border px-3 py-1 disabled:opacity-50 xs:text-[12px] 2xs:text-[12px] xs-max:text-[12px]"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
};

export default NewsandInformation;

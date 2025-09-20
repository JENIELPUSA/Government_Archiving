import React, { useState, useEffect, useContext } from "react";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

// Improved Skeleton Loading Component
const SkeletonCard = () => (
    <div className="mb-4 flex animate-pulse items-start rounded-lg bg-white p-6 shadow-md">
        {/* Image skeleton */}
        <div className="mr-4 h-24 w-24 flex-shrink-0 rounded-lg bg-gray-200"></div>
        {/* Content skeleton */}
        <div className="flex-1">
            <div className="mb-2 h-7 w-3/4 rounded bg-gray-200"></div>
            <div className="mb-1 h-4 rounded bg-gray-200"></div>
            <div className="mb-1 h-4 w-5/6 rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            <div className="mt-4 h-5 w-24 rounded bg-gray-200"></div>
        </div>
    </div>
);

// News Card Component
const NewsCard = ({ title, excerpt, linkText, imageUrl, onClick }) => (
    <div className="mb-4 flex items-start rounded-lg bg-white p-6 shadow-md">
        {imageUrl && (
            <div className="mr-4 h-24 w-24 flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={title || "News image"}
                    className="h-full w-full rounded-lg object-cover"
                />
            </div>
        )}
        <div className="flex-1">
            <h2 className="text-xl font-bold leading-tight text-blue-700 md:text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{excerpt}</p>
            <button
                onClick={onClick}
                className="mt-4 inline-block text-blue-500 hover:underline"
            >
                {linkText}
            </button>
        </div>
    </div>
);

const NewsandLatest = ({ onNewsView }) => {
    const { pictures, loading } = useContext(NewsDisplayContext);
    const [displayedNews, setDisplayedNews] = useState([]);

    useEffect(() => {
        if (Array.isArray(pictures) && pictures.length > 0) {
            setDisplayedNews(pictures.slice(0, 4));
        }
    }, [pictures]);

    return (
        <div className="mt-4 flex min-h-screen items-start justify-center">
            <div className="w-full max-w-4xl">
                <h1 className="2xs:text-2xl mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-center font-bold text-white shadow-lg lg:text-3xl">
                    News and Information
                </h1>

                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    displayedNews.map((news, index) => (
                        <NewsCard
                            key={index}
                            className="2xs:p-6 xs:p-8 2xs:text-[10px] rounded-lg bg-white p-4 shadow-md transition-all hover:shadow-lg lg:p-10"
                            title={news.title || "No Title"}
                            excerpt={
                                news.excerpt && news.excerpt.length > 200
                                    ? news.excerpt.slice(0, 200) + "..."
                                    : news.excerpt || "No excerpt available"
                            }
                            imageUrl={news.avatar?.url}
                            linkText="Read More..."
                            onClick={() => {
                                if (typeof onNewsView === "function") {
                                    onNewsView(news);
                                } else {
                                    console.error("onNewsView prop is not a function.");
                                }
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default NewsandLatest;

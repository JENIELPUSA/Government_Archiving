import React, { useState, useEffect, useContext } from "react";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

// Improved Skeleton with consistent height
const SkeletonCard = () => (
    <div className="mb-6 flex animate-pulse items-start rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mr-4 h-20 w-20 flex-shrink-0 rounded-lg bg-gray-200"></div>
        <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-20 rounded bg-gray-200"></div>
        </div>
    </div>
);

const NewsCard = ({ title, excerpt, linkText, imageUrl, onClick }) => (
    <div className="mb-6 flex items-start rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md xs:mb-2 xs-max:mb-2">
        {imageUrl && (
            <div className="mr-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                    src={imageUrl}
                    alt={title || "News thumbnail"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>
        )}
        <div className="flex-1">
            <h2 className="line-clamp-2 text-lg font-bold leading-tight text-blue-700 2xs:text-[12px] xs:text-[12px] xs-max:text-[12px]">{title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-gray-600 2xs:text-[10px] xs:text-[10px] xs-max:text-[12px]">{excerpt}</p>
            <button
                onClick={onClick}
                aria-label={`Read more about ${title}`}
                className="mt-3 inline-block rounded text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 2xs:text-[10px] xs:text-[10px] xs-max:text-[12px]"
            >
                {linkText}
            </button>
        </div>
    </div>
);

const FBPageEmbed = () => {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
        setShow(true); // mount after first render
    }, []);

    if (!show) return null;

    const pageUrl = "https://www.facebook.com/provincialgovernmentofbiliran";
    const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
        pageUrl,
    )}&tabs=timeline&width=340&height=700&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false`;

    return (
        <iframe
            title="Facebook Page Timeline"
            src={src}
            className="h-[600px] w-full sm:h-[700px]"
            style={{ border: "none" }}
            scrolling="no"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
        />
    );
};

const NewsandLatest = ({ onNewsView }) => {
    const { pictures, loading } = useContext(NewsDisplayContext);
    const [displayedNews, setDisplayedNews] = useState([]);

    useEffect(() => {
        if (!loading && Array.isArray(pictures)) {
            setDisplayedNews(pictures.slice(0, 4));
        }
    }, [pictures, loading]);

    return (
        <div className="mx-auto w-full max-w-7xl py-3">
            <h1 className="mb-3 flex items-center text-2xl font-bold text-blue-800 md:text-3xl 2xs:mb-2 xs:mb-2 xs-max:mb-2">
                <span className="flex-1 border-b border-gray-300"></span>
                <span className="px-4 2xs:text-[17px] xs:text-[17px] xs-max:text-[20px]">News and Information</span>
                <span className="flex-1 border-b border-gray-300"></span>
            </h1>

            <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
                {/* News Section - 3/5 */}
                <div className="flex flex-col gap-0 lg:col-span-3">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : displayedNews.length > 0 ? (
                        displayedNews.map((news) => (
                            <NewsCard
                                key={news.id || news.title}
                                title={news.title || "No Title"}
                                excerpt={
                                    news.excerpt && news.excerpt.length > 180
                                        ? news.excerpt.slice(0, 180) + "..."
                                        : news.excerpt || "No excerpt available"
                                }
                                imageUrl={news.avatar?.url}
                                linkText="Read More"
                                onClick={() => onNewsView?.(news)}
                            />
                        ))
                    ) : (
                        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                            <p className="text-gray-500">No news available at the moment.</p>
                        </div>
                    )}
                </div>

                <aside className="col-span-full mb-6 lg:col-span-2 lg:mb-0">{typeof window !== "undefined" && <FBPageEmbed />}</aside>
            </div>
        </div>
    );
};

export default NewsandLatest;

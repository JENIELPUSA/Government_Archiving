import React, { useState, useEffect, useContext } from "react";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import { FileText } from "lucide-react";

// Skeleton Loader
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

// Redesigned NewsCard with Bagong Pilipinas theme
const NewsCard = ({ title, excerpt, linkText, imageUrl, onClick, category }) => (
  <div className="relative mb-6 flex items-start rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 via-white to-red-50 p-5 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md xs:mb-2 xs-max:mb-2">
    {/* Top accent bar */}
    <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-700 via-yellow-400 to-red-600"></div>

    {/* Image */}
    {imageUrl && (
      <div className="mr-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
        <img
          src={imageUrl}
          alt={title || "News thumbnail"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )}

    {/* Content */}
    <div className="flex-1">
      <div className="flex items-start justify-between flex-wrap gap-1">
        <h2 className="line-clamp-2 text-lg font-extrabold leading-tight text-blue-800 2xs:text-[12px] xs:text-[12px] xs-max:text-[12px]">
          {title}
        </h2>

        {/* Category / Resolution Tag */}
        {category && (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-700 via-yellow-400 to-red-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            <FileText size={13} />
            {category === "Resolution" ? "Resolution" : category}
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-gray-700 2xs:text-[10px] xs:text-[10px] xs-max:text-[12px]">
        {excerpt}
      </p>

      <button
        onClick={onClick}
        aria-label={`Read more about ${title}`}
        className="mt-3 inline-block rounded text-sm font-semibold text-blue-700 hover:text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 2xs:text-[10px] xs:text-[10px] xs-max:text-[12px]"
      >
        {linkText}
      </button>
    </div>
  </div>
);

const FBPageEmbed = () => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;
  const pageUrl = "https://web.facebook.com/spbiliran2019";
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    pageUrl
  )}&tabs=timeline&width=340&height=700&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false`;

  return (
    <iframe
      title="Facebook Page Timeline"
      src={src}
      className="h-[800px] w-full sm:h-[700px]"
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
    <div className="mx-auto w-full max-w-7xl ">
      {/* Section Header */}
      <div className="text-center mb-2 xs:py-2 py-4">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-blue-800">
          <span className="h-1 w-10 bg-red-600 rounded-full"></span>
          News and Information
          <span className="h-1 w-10 bg-yellow-400 rounded-full"></span>
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Stay updated with resolutions, programs, and community efforts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
        {/* News Section */}
        <div className="flex flex-col gap-[1px] lg:col-span-3">
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
                category={news.Category}
                onClick={() => onNewsView?.(news)}
              />
            ))
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
              <p className="text-gray-500">No news available at the moment.</p>
            </div>
          )}
        </div>

        {/* Facebook Embed */}
        <aside className="col-span-full mb-6 lg:col-span-2 lg:mb-0">
          {typeof window !== "undefined" && <FBPageEmbed />}
        </aside>
      </div>
    </div>
  );
};

export default NewsandLatest;

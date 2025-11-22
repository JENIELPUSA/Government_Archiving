import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

const NewsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const [filter, setFilter] = useState("All"); // Default to All
  const { pictures, setLoading, loading } = useContext(NewsDisplayContext);

  const [provincialNews, setProvincialNews] = useState([]);
  const [nationalNews, setNationalNews] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Process Provincial News - Priority
  useEffect(() => {
    if (!pictures || pictures.length === 0) {
      setProvincialNews([]);
      return;
    }

    try {
      const provincialData = pictures
        .filter(item => item && (item.source === "Provincial" || !item.source))
        .map((item, index) => ({
          id: item.id || item._id || `provincial-${index}-${Date.now()}`,
          title: item.title || item.name || "Untitled Provincial News",
          summary: item.summary || item.excerpt || "No summary available.",
          date: item.date || item.createdAt || new Date().toISOString(),
          image: item.image || (item.avatar && item.avatar.url) || item.url,
          source: "Provincial",
          link: item.link || item.url || "#",
          priority: 1 // Higher priority for Provincial
        }));

      setProvincialNews(provincialData);
    } catch (error) {
      console.error("Error processing provincial news:", error);
      setProvincialNews([]);
    }
  }, [pictures]);

  // Fetch National News
  const fetchNews = useCallback(async () => {
    if (hasFetched) return;

    setLoading(true);
    setFetchError(null);

    try {
      const url = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News/national`;
      const response = await axios.get(url);

      if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
        const processedNationalNews = response.data.data.map((item, index) => ({
          id: item._id || `national-${index}-${Date.now()}`,
          title: item.title || "No title available",
          summary: item.excerpt || "No summary available.",
          date: item.date || new Date().toISOString(),
          image: (item.avatar && item.avatar.url) || "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&q=80&w=800",
          source: "National",
          link: item.link || "#",
          priority: 2 // Lower priority for National
        }));
        setNationalNews(processedNationalNews);
      } else {
        setNationalNews([]);
      }
    } catch (error) {
      console.error("Error fetching national news:", error);
      setFetchError(`Failed to load national news: ${error.message}`);
      setNationalNews([]);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [hasFetched, setLoading]);

  useEffect(() => {
    if (!hasFetched) {
      fetchNews();
    }
  }, [hasFetched, fetchNews]);

  const formatDate = dateString => {
    if (!dateString) return "Recent";
    try {
      if (typeof dateString === "string" && dateString.includes("/")) {
        const [month, day, year] = dateString.split("/").map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      }
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const displayedNews = useMemo(() => {
    let result = [];
    if (filter === "All") {
      result = [...provincialNews, ...nationalNews];
      // Sort by priority first (Provincial first), then by date
      result.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority; // Lower priority number first
        }
        return new Date(b.date) - new Date(a.date);
      });
    } else if (filter === "Provincial") {
      result = [...provincialNews].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filter === "National") {
      result = [...nationalNews].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return result.filter((item, index, self) => index === self.findIndex(t => t.id === item.id));
  }, [filter, provincialNews, nationalNews]);

  const getFallbackImage = source => source === "National"
    ? "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&q=80&w=800"
    : "https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=800";

  if (loading && !hasFetched) {
    return (
      <section id="news" className="min-h-screen bg-blue-950 py-20 flex items-center justify-center">
        <div className="text-center text-white">
          <FaSpinner className="text-4xl text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading latest news...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="min-h-screen bg-blue-950 py-20" ref={sectionRef}>
      <div className="mx-auto w-full max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">News & Updates</h2>
          <p className="mx-auto max-w-2xl text-gray-200">
            Stay informed with the latest happenings in the Province of Biliran and national news.
          </p>
        </div>

        {/* Filter Buttons - All first */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h3 className="text-2xl font-bold text-white">
            {filter === "All" ? "All News" : 
             filter === "Provincial" ? "Provincial News" : 
             "National News"}
           
          </h3>
          <div className="flex gap-2">
            {["All", "Provincial", "National"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  filter === f 
                    ? f === "All" 
                      ? "bg-green-600 text-white shadow-lg" 
                      : f === "Provincial"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-red-600 text-white shadow-lg"
                    : "border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {f}
                {f === "Provincial" && provincialNews.length > 0 && (
                  <span className="ml-2 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs">
                    {provincialNews.length}
                  </span>
                )}
                {f === "All" && provincialNews.length > 0 && (
                  <span className="ml-2 bg-white text-green-600 rounded-full px-2 py-0.5 text-xs">
                    {provincialNews.length + nationalNews.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {fetchError}
          </div>
        )}

        {/* Modern News Grid - Provincial Priority in All view */}
        <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedNews.length > 0 ? (
            displayedNews.map((news, index) => (
              <div
                key={news.id}
                className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  // Feature first news item more prominently in All view
                  index === 0 && filter === "All" 
                    ? "md:col-span-2 lg:col-span-2 md:row-span-2" 
                    : ""
                } ${
                  news.source === "Provincial" 
                    ? "ring-1 ring-blue-100 border-l-4 border-l-blue-500" 
                    : "ring-1 ring-gray-100 border-l-4 border-l-red-500"
                }`}
              >
                <div className="relative h-48 overflow-hidden md:h-56">
                  <img
                    src={news.image || getFallbackImage(news.source)}
                    alt={news.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => { e.target.src = getFallbackImage(news.source); }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${
                    news.source === "National" ? "bg-red-600" : "bg-blue-600"
                  }`}>
                    {news.source}
                    {news.source === "Provincial" && filter === "All" && " ★"}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-medium text-white/90">{formatDate(news.date)}</span>
                    <h3 className="mt-1 text-lg font-bold text-white line-clamp-2">
                      {news.link && news.link !== "#" ? (
                        <a href={news.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200">{news.title}</a>
                      ) : news.title}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-4 line-clamp-3 flex-1 text-gray-700">{news.summary}</p>
                  {news.link && news.link !== "#" && (
                    <a 
                      href={news.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`mt-auto inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors ${
                        news.source === "Provincial" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Read Full Story
                      <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-white">
              {loading ? "Loading news..." : `No ${filter.toLowerCase()} news available.`}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
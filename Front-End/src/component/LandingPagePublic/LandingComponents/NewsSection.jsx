import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

const NewsSection = ({ onNewsView }) => {
  const sectionRef = useRef(null);
  const cardsRef = useRef(null);
  const { pictures, setLoading, loading } = useContext(NewsDisplayContext);

  const [provincialNews, setProvincialNews] = useState([]);
  const [nationalNews, setNationalNews] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Process Provincial News
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
          priority: 1,
          fullContent: item.fullContent || item.content || item.summary || "This is the full content of the provincial news. It contains detailed information about the event, announcements, or updates from the Provincial Government of Biliran.",
          category: item.category || item.Category || "Provincial News",
          author: item.author || "Provincial Government of Biliran",
          readTime: "3 min read"
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
          priority: 2,
          fullContent: item.fullContent || item.content || item.excerpt || "This is the full content of the national news. It contains comprehensive details about national developments, policies, and events that may affect the Province of Biliran and its residents.",
          category: item.category || "National News",
          author: item.author || "National Government",
          readTime: "4 min read"
        }));
        
        // Sort by date (newest first) and limit to 3 latest news
        const sortedAndLimitedNationalNews = processedNationalNews
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
        
        setNationalNews(sortedAndLimitedNationalNews);
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

  const handleReadMore = (news) => {
    if (onNewsView) {
      onNewsView(news);
    } else {
      if (news.link && news.link !== "#") {
        window.open(news.link, '_blank');
      } else {
        console.log("News details:", news);
        alert(`Full Content: ${news.title}\n\n${news.fullContent}`);
      }
    }
  };

  const formatDate = dateString => {
    if (!dateString) return "Recent";
    try {
      if (typeof dateString === "string" && dateString.includes("/")) {
        const [month, day, year] = dateString.split("/").map(num => parseInt(num, 10));
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const getTimeAgo = dateString => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInHours / 24;

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInDays < 7) {
        return `${Math.floor(diffInDays)}d ago`;
      } else {
        return formatDate(dateString);
      }
    } catch {
      return "Recent";
    }
  };

  const displayedNews = useMemo(() => {
    const combined = [...provincialNews, ...nationalNews];
    combined.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(b.date) - new Date(a.date);
    });

    return combined.filter((item, index, self) => index === self.findIndex(t => t.id === item.id));
  }, [provincialNews, nationalNews]);

  const getFallbackImage = source =>
    source === "National"
      ? "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&q=80&w=800"
      : "https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=800";

  // Skeleton card component (inline)
  const SkeletonCard = ({ isFeatured = false }) => (
    <div className={`group relative flex flex-col overflow-hidden rounded-3xl ${isFeatured ? "md:col-span-2 lg:col-span-2" : ""}`}>
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl"></div>
      
      {/* Image skeleton */}
      <div className={`relative overflow-hidden ${isFeatured ? "h-64 sm:h-72 md:h-80" : "h-56 sm:h-64"}`}>
        <div className="h-full w-full bg-gray-700/50 animate-pulse"></div>
        
        {/* Source badge skeleton */}
        <div className="absolute right-4 top-4">
          <div className="h-8 w-20 rounded-2xl bg-gray-600/50 animate-pulse"></div>
        </div>
        
        {/* Title overlay skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-16 rounded-full bg-gray-600/50 animate-pulse"></div>
          </div>
          <div className={`${isFeatured ? "h-8 w-3/4 mb-3" : "h-6 w-full mb-2"} bg-gray-600/50 animate-pulse rounded-lg`}></div>
          <div className={`${isFeatured ? "h-6 w-1/2" : "h-4 w-2/3"} bg-gray-600/50 animate-pulse rounded-lg`}></div>
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="relative flex flex-1 flex-col p-6 sm:p-8">
        {/* Category badge */}
        <div className="mb-4">
          <div className="h-8 w-24 rounded-2xl bg-gray-600/50 animate-pulse"></div>
        </div>
        
        {/* Summary lines */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-600/50 animate-pulse rounded"></div>
          <div className="h-4 w-5/6 bg-gray-600/50 animate-pulse rounded"></div>
          <div className="h-4 w-4/6 bg-gray-600/50 animate-pulse rounded"></div>
        </div>
        
        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="h-5 w-20 bg-gray-600/50 animate-pulse rounded"></div>
          <div className="h-10 w-28 rounded-2xl bg-gray-600/50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Loading state with skeleton grid
  if (loading && !hasFetched) {
    return (
      <section id="news" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-24">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_60%)]"></div>
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Ultra Modern Header */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-md border border-white/10">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent tracking-wide">
                LIVE UPDATES
              </span>
            </div>
            
            <h2 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
              <span className="inline-block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                News & Updates
              </span>
            </h2>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 font-light leading-relaxed">
              Your trusted source for <span className="text-blue-400 font-medium">provincial</span> and <span className="text-red-400 font-medium">national</span> news
            </p>
          </div>

          {/* Modern Section Divider */}
          <div className="mb-16 flex items-center justify-center gap-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Latest Stories</h3>
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          </div>

          {/* Skeleton Grid - mimics bento layout */}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard isFeatured={true} />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  // Main content render when not loading
  return (
    <section id="news" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-24" ref={sectionRef}>
      {/* Enhanced Animated Background with Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_60%)]"></div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Ultra Modern Header */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-md border border-white/10">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse"></div>
            <span className="text-sm font-medium bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent tracking-wide">
              LIVE UPDATES
            </span>
          </div>
          
          <h2 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
            <span className="inline-block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              News & Updates
            </span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 font-light leading-relaxed">
            Your trusted source for <span className="text-blue-400 font-medium">provincial</span> and <span className="text-red-400 font-medium">national</span> news
          </p>
        </div>

        {/* Modern Section Divider */}
        <div className="mb-16 flex items-center justify-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Latest Stories</h3>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>

        {/* Advanced Bento Grid Layout */}
        <div ref={cardsRef} className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayedNews.length > 0 ? (
            displayedNews.map((news, index) => (
              <div
                key={news.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-2 ${
                  index === 0 
                    ? "md:col-span-2 lg:col-span-2" 
                    : ""
                }`}
              >
                {/* Glassmorphic Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-700 group-hover:border-white/30 group-hover:shadow-2xl group-hover:shadow-blue-500/20"></div>
                
                {/* Dynamic Gradient Overlay on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl"></div>

                {/* Animated Corner Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Image Container with Multi-layer Effects */}
                <div className={`relative overflow-hidden ${
                  index === 0 ? "h-64 sm:h-72 md:h-80" : "h-56 sm:h-64"
                }`}>
                  <img
                    src={news.image || getFallbackImage(news.source)}
                    alt={news.title}
                    className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                    onError={e => { e.target.src = getFallbackImage(news.source); }}
                  />
                  
                  {/* Multi-layer Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30"></div>
                  
                  {/* Modern Source Badge with Animation */}
                  <div className="absolute right-4 top-4">
                    <div className={`group/badge relative overflow-hidden rounded-2xl px-4 py-2 backdrop-blur-xl border transition-all duration-300 ${
                      news.source === "National" 
                        ? "bg-gradient-to-r from-red-500/90 to-pink-500/90 border-red-400/30 shadow-lg shadow-red-500/30" 
                        : "bg-gradient-to-r from-blue-500/90 to-cyan-500/90 border-blue-400/30 shadow-lg shadow-blue-500/30"
                    }`}>
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/badge:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="relative flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          news.source === "National" ? "bg-white" : "bg-white"
                        }`}></div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {news.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Title Overlay with Better Typography */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    {/* Time and Read Time Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse"></div>
                        <span className="text-xs font-semibold text-blue-100 tracking-wide">
                          {getTimeAgo(news.date)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Title with Shadow Effect */}
                    <h3 className={`font-black text-white line-clamp-2 leading-tight mb-3 ${
                      index === 0 ? "text-2xl sm:text-3xl md:text-4xl" : "text-xl sm:text-2xl"
                    }`} style={{textShadow: '0 4px 12px rgba(0,0,0,0.8)'}}>
                      {news.title}
                    </h3>
                    
                    {/* Additional Info for Featured Article */}
                    {index === 0 && (
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="font-medium">{news.author}</span>
                        <span>•</span>
                        <span>{news.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Area with Improved Spacing */}
                <div className="relative flex flex-1 flex-col p-6 sm:p-8">
                  {/* Category Badge with Better Design */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl bg-gradient-to-r from-white/10 to-white/5 text-blue-200 border border-white/10 backdrop-blur-sm uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      {news.category}
                    </span>
                  </div>

                  {/* Summary with Better Typography */}
                  <p className="mb-6 line-clamp-3 flex-1 text-gray-300 leading-relaxed text-base">
                    {news.summary}
                  </p>
                  
                  {/* Footer with Icon and CTA */}
                  <div className="mt-auto flex items-center justify-between gap-4">
                    {/* Date with Calendar Icon */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(news.date)}</span>
                    </div>
                    
                    {/* Enhanced CTA Button with Arrow Icon */}
                    <button
                      onClick={() => handleReadMore(news)}
                      className={`group/btn relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 ${
                        news.source === "Provincial"
                          ? "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:shadow-blue-500/50"
                          : "bg-gradient-to-r from-red-600 via-red-700 to-pink-600 hover:shadow-red-500/50"
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative flex items-center gap-2">
                        Read More
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <div className="inline-block p-12 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-xl font-light">
                  {loading ? "Loading news..." : "No news available at the moment."}
                </p>
                <p className="text-gray-500 text-sm mt-2">Check back later for updates</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
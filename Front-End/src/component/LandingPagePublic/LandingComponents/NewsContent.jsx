import React, { useState, useEffect, useContext } from "react";
import Mylogo from "../../../assets/logo-login.png";
import bagongpilipinas from "../../../assets/bagongpilipinas.png";
import BannerImage from "../../PublicView/BannerImage";
import Breadcrumb from "../../PublicView/Breadcrumb";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

const NewsContent = ({ news, onBack }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { pictures } = useContext(NewsDisplayContext);
    const latestNews = [...pictures].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    console.log("news", news);

    useEffect(() => {
        if (!news || !news.title) {
            setIsLoading(true);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [news]);

    const SkeletonLoading = () => (
        <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Header Skeleton */}
            <div className="border-b border-gray-100 p-6">
                <div className="h-5 w-32 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
            </div>

            {/* Image Skeleton */}
            <div className="relative">
                <div className="h-[500px] w-full animate-pulse bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                    <div className="mb-4 flex justify-center space-x-6">
                        <div className="h-16 w-16 animate-pulse rounded-full bg-white/20 backdrop-blur-sm"></div>
                        <div className="h-16 w-16 animate-pulse rounded-full bg-white/20 backdrop-blur-sm"></div>
                    </div>
                    <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/20 backdrop-blur-sm"></div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4 p-8">
                <div className="h-6 w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="h-6 w-5/6 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="h-6 w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="h-6 w-4/6 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
            </div>

            {/* Footer Skeleton */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <div className="mx-auto h-7 w-64 animate-pulse rounded-lg bg-white/20"></div>
            </div>
        </div>
    );

    const SidebarSkeleton = () => (
        <div className="hidden w-96 lg:block">
            <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                    <div className="h-6 w-56 animate-pulse rounded-lg bg-white/30"></div>
                </div>
                <div className="p-6">
                    <ul className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <li key={i} className="flex gap-4 rounded-xl bg-gray-50 p-3">
                                <div className="h-20 w-28 animate-pulse rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
                                    <div className="h-3 w-3/4 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 to-gray-300"></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <>
                <BannerImage selection={"Information Content"} />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-6 antialiased">
                    <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
                        <div className="w-full lg:max-w-5xl">
                            <SkeletonLoading />
                        </div>
                        <SidebarSkeleton />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <BannerImage selection={"Information Content"} />
            <Breadcrumb position={"Information Content"} />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-6 antialiased">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
                    {/* Main Content */}
                    <div className="w-full lg:max-w-5xl">
                        <article className="overflow-hidden rounded-2xl bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl">
                            {/* Header with Modern Badge */}
                            <header className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onBack}
                                        className="group flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-300 hover:bg-blue-100 hover:shadow-md"
                                    >
                                        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                    <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
                                        {news.category}
                                    </span>
                                </div>
                            </header>

                            {/* Hero Image with Gradient Overlay and Logos */}
                            <div className="relative overflow-hidden">
                                <div className="aspect-video w-full overflow-hidden">
                                    <img
                                        src={news.image || "https://placehold.co/1200x675/e2e8f0/64748b?text=No+Image"}
                                        alt={news.alt || news.title}
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                                
                                {/* Gradient Overlay - Retained opacity */}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-700/60 to-transparent"></div>

                                {/* Content Overlay */}
                                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-8 text-white xs:p-4">
                                    {/* Logos with backdrop blur */}
                                    <div className="mb-6 flex items-center justify-center gap-6 xs:mb-3 xs:gap-3 xs:p-2">
                                        <img
                                            src={Mylogo}
                                            alt="Municipal Logo"
                                            className="h-16 object-contain drop-shadow-lg transition-transform duration-300 hover:scale-110 md:h-20 xs:h-10"
                                        />
                                        <div className="h-16 w-px bg-white/30 md:h-20 xs:h-10"></div>
                                        <img
                                            src={bagongpilipinas}
                                            alt="Bagong Pilipinas Logo"
                                            className="h-16 object-contain drop-shadow-lg transition-transform duration-300 hover:scale-110 md:h-20 xs:h-10"
                                        />
                                    </div>

                                    {/* Title */}
                                    <h1 className="max-w-4xl text-center text-3xl font-bold leading-tight drop-shadow-lg md:text-5xl xs:text-lg">
                                        {news.title}
                                    </h1>
                                </div>
                            </div>

                            {/* Article Content */}
                            <main className="p-8 xs:p-4">
                                <div className="prose prose-lg mx-auto max-w-none text-gray-700 xs:prose-sm">
                                    {news.summary
                                        ?.split("\n")
                                        .filter((part) => part.trim() !== "")
                                        .map((part, idx) => (
                                            <p key={idx} className="mb-6 text-justify leading-relaxed first:mt-0 last:mb-0">
                                                {part.trim()}
                                            </p>
                                        )) || <p className="text-center text-gray-500">No content available.</p>}
                                </div>
                            </main>

                            {/* Footer with Gradient */}
                            <footer className="mt-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-6 text-center">
                                <p className="text-2xl font-bold tracking-wide text-white drop-shadow-md xs:text-base">
                                    BILIRAN, PHILIPPINES
                                </p>
                            </footer>
                        </article>
                    </div>

                    {/* Modern Sidebar */}
                    <aside className="hidden w-96 lg:block">
                        <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-xl">
                            {/* Sidebar Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    Latest News
                                </h2>
                            </div>

                            {/* News Items */}
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {latestNews.map((item, index) => (
                                        <li
                                            key={item.id}
                                            className="group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <div className="flex gap-4">
                                                {/* Thumbnail with Overlay */}
                                                <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                                                    <img
                                                        src={item.avatar?.url || "https://placehold.co/140x100/e2e8f0/64748b?text=News"}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-blue-600/0 transition-colors duration-300 group-hover:bg-blue-600/10"></div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex min-w-0 flex-1 flex-col justify-center">
                                                    <p className="line-clamp-2 text-sm font-semibold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                                                        {item.title}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-xs font-medium text-gray-500">{item.date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default NewsContent;
import React, { useState, useEffect, useContext } from "react";
import Mylogo from "../../../assets/logo-login.png";
import bagongpilipinas from "../../../assets/bagongpilipinas.png";
import BannerImage from "../BannerImage";
import Breadcrumb from "../Breadcrumb";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

const NewsContent = ({ news, onBack }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { pictures } = useContext(NewsDisplayContext);
    const latestNews = [...pictures].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

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
        <div className="w-full max-w-5xl rounded-xl bg-white p-4 shadow-lg md:p-8">
            {/* Header Skeleton */}
            <header className="mb-6">
                <div className="h-5 w-32 animate-pulse rounded-md bg-gray-200"></div>
            </header>

            {/* Image Skeleton */}
            <div className="relative mb-12 xs:mb-4">
                <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 md:h-96"></div>
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center p-4">
                    <div className="mb-2 flex justify-center space-x-6 xs:mb-0 xs:space-x-3">
                        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300 md:h-16 xs:h-8"></div>
                        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300 md:h-16 xs:h-8"></div>
                    </div>
                    <div className="mx-auto h-6 w-3/4 animate-pulse rounded-md bg-gray-300 xs:h-5"></div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-4 xs:space-y-2">
                <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div className="h-5 w-5/6 animate-pulse rounded-md bg-gray-200"></div>
                <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                <div className="h-5 w-4/6 animate-pulse rounded-md bg-gray-200"></div>
                <div className="h-5 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
            </div>

            {/* Footer Skeleton */}
            <footer className="mt-8 xs:mt-2">
                <div className="rounded-b-xl bg-gray-200 px-4 py-4 text-center">
                    <div className="mx-auto h-6 w-48 animate-pulse rounded-md bg-gray-300 xs:h-5"></div>
                </div>
            </footer>
        </div>
    );

    const SidebarSkeleton = () => (
        <div className="hidden w-80 lg:block">
            <div className="sticky top-6 rounded-xl bg-white p-4 shadow-lg">
                <div className="mb-4 h-5 w-48 animate-pulse rounded-md bg-gray-200"></div>
                <ul className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <li
                            key={i}
                            className="flex gap-3 pb-3 last:border-0"
                        >
                            <div className="h-16 w-20 animate-pulse rounded-md bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <>
                <BannerImage selection={"Information Content"} />
                <div className="min-h-screen bg-gray-100 p-4 text-gray-800 antialiased">
                    <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:gap-8">
                        {/* Main Content Skeleton */}
                        <div className="w-full lg:max-w-5xl">
                            <SkeletonLoading />
                        </div>

                        {/* Sidebar Skeleton */}
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
            <div className="min-h-screen bg-gray-100 p-4 text-gray-800 antialiased">
                <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:gap-8">
                    {/* Main Content */}
                    <div className="w-full lg:max-w-5xl">
                        <div className="rounded-xl bg-white p-4 shadow-lg md:p-8">
                            {/* Header */}
                            <header className="mb-6">
                                <p className="text-sm text-gray-500">
                                    <button
                                        onClick={onBack}
                                        className="text-blue-600 hover:underline"
                                    >
                                        ← Back
                                    </button>{" "}
                                    <span className="ml-1">{news.category}</span>
                                </p>
                            </header>

                            {/* Main Content */}
                            <main>
                                <div className="relative mb-12 xs:mb-4">
                                    <img
                                        src={news.avatar?.url || "https://placehold.co/900x600/e2e8f0/fff?text=No+Image"}
                                        alt={news.alt || news.title}
                                        className="h-64 w-full rounded-xl object-cover shadow-md md:h-96"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-blue-700 via-blue-700/70 to-transparent"></div>

                                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center p-4 text-white">
                                        <div className="mb-2 flex justify-center space-x-6 xs:mb-0 xs:space-x-3">
                                            <img
                                                src={Mylogo}
                                                alt="Municipal Logo"
                                                className="h-12 object-contain md:h-16 xs:h-8"
                                            />
                                            <img
                                                src={bagongpilipinas}
                                                alt="Bagong Pilipinas Logo"
                                                className="h-12 object-contain md:h-16 xs:h-8"
                                            />
                                        </div>
                                        <h1 className="px-2 text-center text-xl font-bold md:text-3xl xs:text-sm">{news.title}</h1>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="space-y-6 text-justify text-lg leading-relaxed xs:space-y-2 xs:text-[12px]">
                                    {news.excerpt
                                        ?.split("\n")
                                        .filter((part) => part.trim() !== "")
                                        .map((part, idx) => <p key={idx}>{part.trim()}</p>) || <p>No content available.</p>}
                                </div>
                            </main>

                            {/* Footer */}
                            <footer className="mt-8 xs:mt-2">
                                <div className="rounded-b-xl bg-blue-600 px-4 py-4 text-center text-white xs:p-2 xs:py-2">
                                    <span className="text-xl font-bold xs:text-[12px]">BILIRAN, PHILIPPINES</span>
                                </div>
                            </footer>
                        </div>
                    </div>

                    {/* Sidebar - Latest News with Images */}
                    <aside className="hidden w-96 lg:block">
                        {" "}
                        {/* ↑ Lapad: 24rem (384px) instead of 20rem */}
                        <div className="sticky top-6 rounded-xl bg-white p-5 shadow-lg">
                            <h2 className="mb-4 text-xl font-bold text-gray-800">
                                {" "}
                                {/* ↑ Slightly larger text */}
                                Latest News & Information
                            </h2>
                            <ul className="space-y-5">
                                {" "}
                                {/* ↑ More spacing between items */}
                                {latestNews.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex cursor-pointer gap-4 rounded-lg border-b border-gray-100 p-2 pb-4 transition last:border-0 hover:bg-gray-50"
                                    >
                                        {/* ↑ Larger image container: w-28 h-20 (7rem × 5rem) */}
                                        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                                            <img
                                                src={item.avatar?.url || "https://placehold.co/140x100/e2e8f0/64748b?text=News"}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-sm font-semibold text-blue-600 hover:underline">{item.title}</p>
                                            <p className="mt-1 text-xs text-gray-500">{item.date}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default NewsContent;

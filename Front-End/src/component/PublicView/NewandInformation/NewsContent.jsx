import React, { useState, useEffect } from "react";
import Mylogo from "../../../assets/logo-login.png";
import bagongpilipinas from "../../../assets/bagongpilipinas.png";

const NewsContent = ({ news, onBack }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [news]);

    // Improved Skeleton Loading Component with proper width
    const SkeletonLoading = () => (
        <div className="relative z-10 w-full max-w-5xl rounded-xl bg-white p-4 shadow-lg md:p-8">
            {/* Header Skeleton */}
            <header className="mb-6">
                <div className="h-5 w-32 animate-pulse rounded-md bg-gray-200"></div>
            </header>

            {/* Main Content Skeleton */}
            <main>
                {/* Image Skeleton - Full width */}
                <div className="relative mb-12 w-full">
                    <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 md:h-96"></div>
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center p-4">
                        <div className="mb-4 flex justify-center space-x-6">
                            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300 md:h-16 md:w-16"></div>
                            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300 md:h-16 md:w-16"></div>
                        </div>
                        <div className="mx-auto h-8 w-3/4 animate-pulse rounded-md bg-gray-300"></div>
                    </div>
                </div>

                {/* Content Section Skeleton */}
                <div className="w-full space-y-4">
                    <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                    <div className="h-5 w-5/6 animate-pulse rounded-md bg-gray-200"></div>
                    <div className="h-5 w-full animate-pulse rounded-md bg-gray-200"></div>
                    <div className="h-5 w-4/6 animate-pulse rounded-md bg-gray-200"></div>
                    <div className="h-5 w-3/4 animate-pulse rounded-md bg-gray-200"></div>
                </div>

                {/* Footer Skeleton */}
                <div className="mt-8 w-full">
                    <div className="w-full animate-pulse rounded-b-xl bg-gray-200 px-4 py-4 text-center">
                        <div className="mx-auto h-6 w-48 rounded-md bg-gray-300"></div>
                    </div>
                </div>
            </main>
        </div>
    );

    if (isLoading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 text-gray-800 antialiased">
                <SkeletonLoading />
            </div>
        );
    }

    // Actual content
    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 text-gray-800 antialiased">
            <div className="relative z-10 w-full max-w-5xl rounded-xl bg-white p-4 shadow-lg md:p-8">
                {/* Header */}
                <header className="mb-6">
                    <p className="text-sm text-gray-500">
                        <button
                            onClick={onBack}
                            className="text-blue-600 hover:underline"
                        >
                            ← Back
                        </button>{" "}
                        &gt;
                        <span className="ml-1">{news.category}</span>
                    </p>
                </header>

                {/* Main Content */}
                <main>
                    {/* Image Section with Opacity Gradient */}
                    <div className="relative mb-12">
                        <img
                            src={news.avatar?.url || "https://placehold.co/900x600/e2e8f0/fff?text=No+Image"}
                            alt={news.alt || news.title}
                            className="h-64 w-full rounded-xl object-cover shadow-md md:h-96"
                        />
                        {/* New Opacity Blue Gradient Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-blue-700 via-blue-700/70 to-transparent"></div>

                        {/* Logos and Title Container */}
                        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center p-4 text-white">
                            <div className="mb-2 flex justify-center space-x-6">
                                <img
                                    src={Mylogo}
                                    alt="Logo 1"
                                    className="h-12 object-contain md:h-16"
                                />
                                <img
                                    src={bagongpilipinas}
                                    alt="Logo 2"
                                    className="h-12 object-contain md:h-16"
                                />
                            </div>
                            <h1 className="px-4 text-center text-xl font-bold md:text-3xl">{news.title}</h1>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6 text-justify text-lg leading-relaxed">
                        {news.excerpt
                            .split("\n") // hatiin kada newline
                            .map((part, idx) => (part.trim() ? <p key={idx}>{part.trim()}</p> : null))}
                    </div>
                </main>

                {/* Footer-like banner */}
                <footer className="mt-8">
                    <div className="rounded-b-xl bg-blue-600 px-4 py-4 text-center text-white">
                        <span className="text-xl font-bold">BILIRAN, PHILIPPINES</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default NewsContent;

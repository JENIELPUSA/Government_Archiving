import React, { useContext } from "react";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

const RecentPosts = () => {
  const { pictures, loading } = useContext(NewsDisplayContext);

  if (loading) {
    return (
      <div className="w-full bg-gray-100 py-6">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-gray-500 text-sm text-center">Loading recent posts...</p>
        </div>
      </div>
    );
  }

  if (!pictures || pictures.length === 0) {
    return (
      <div className="w-full bg-gray-100 py-6">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-gray-500 text-sm text-center">No recent posts available.</p>
        </div>
      </div>
    );
  }

  const recentPosts = [...pictures]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="p-4">
        <h3 className="mb-2 border-b border-gray-200 pb-1 text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-700">
          RECENT POSTS
        </h3>
        <ul className="list-none m-0 p-0"> {/* Removed space-y-3 */}
          {recentPosts.map((post, index) => (
            <li key={post._id || index} className="flex items-start py-1"> {/* Optional: minimal padding instead of margin */}
              <span className="mr-2 mt-0.5 text-gray-500">•</span>
              <div className="flex-1 min-w-0">
                <a
                  href="#"
                  className="text-[11px] sm:text-sm font-normal leading-tight text-blue-600 hover:underline transition-colors duration-200"
                >
                  {post.title}
                </a>
                <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentPosts;
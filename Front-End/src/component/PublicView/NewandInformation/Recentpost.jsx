import React, { useContext } from "react";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";

const RecentPosts = () => {
  const { pictures, loading } = useContext(NewsDisplayContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-500 text-sm">Loading recent posts...</p>
      </div>
    );
  }

  if (!pictures || pictures.length === 0) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-gray-500 text-sm">No recent posts available.</p>
      </div>
    );
  }

  // Kunin yung recent posts (halimbawa latest 5 lang)
  const recentPosts = [...pictures]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div className=" flex items-center justify-center bg-gray-100 xs:mb-2 mb-6">
      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md md:max-w-md lg:max-w-lg">
        <div className="p-6 md:p-8">
          <h3 className="xs:text-[12px] mb-5 border-b-2 border-gray-200 pb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
            RECENT POSTS
          </h3>
          <ul className="m-0 list-none p-0">
            {recentPosts.map((post, index) => (
              <li key={post._id || index} className="mb-4 flex items-start last:mb-0">
                <span className="mr-2 text-gray-500">•</span>
                <div className="flex-1">
                  <a
                    href="#"
                    className="xs:text-[11px] xs:leading-2 text-sm font-normal leading-tight text-blue-600 transition-colors duration-200 hover:underline"
                  >
                    {post.title}
                  </a>
                  <p className="xs:text-[9px] mt-1 text-xs text-gray-500">
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
    </div>
  );
};

export default RecentPosts;

import React, { useContext, useState } from 'react';
import { NewsDisplayContext } from '../../../contexts/NewsContext/NewsContext';

const NewsandInformation = ({ onViewLatestNews }) => {
  const { pictures, loading } = useContext(NewsDisplayContext);

  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = pictures.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(pictures.length / newsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const truncateExcerpt = (text, maxLength) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  if (loading) {
    return (
      <div className="p-6">
        {Array.from({ length: newsPerPage }).map((_, idx) => (
          <div key={idx} className="h-48 bg-gray-300 rounded mb-4 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">News and Information</h1>

      {currentNews.map((news) => (
        <div key={news.id} className="border-b last:border-b-0 py-4 flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
            <img
              src={news.avatar.url}
              alt={news.title || "News image"}
              className="w-full h-48 object-cover rounded"
            />
          </div>
          <div className="md:w-2/3">
            <h2 className="font-bold text-xl mb-2">{news.title}</h2>
            <p className="text-gray-600 mb-2">{truncateExcerpt(news.excerpt, 150)}</p>
            <button
              onClick={() => onViewLatestNews(news)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read more
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 border rounded ${
              currentPage === number ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NewsandInformation;
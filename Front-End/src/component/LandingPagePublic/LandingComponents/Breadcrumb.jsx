import React from "react";
import PropTypes from "prop-types";

const Breadcrumb = ({ position, onBack }) => {
  // Mapping ng positions para sa display
  const displayPosition = {
    Board_Member: "Board Member",
    Vice_Governor: "Vice Governor",
  }[position] || position; // default sa original kung wala sa mapping

  return (
    <div className="border-b bg-blue-950">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center space-x-1 text-sm text-gray-100">
          <button
            onClick={onBack}
            className="text-gray-100 hover:underline focus:outline-none"
          >
            HOME
          </button>
          <span className="mx-1">/</span>
          <span className="text-gray-100">{displayPosition}</span>
        </div>
      </div>
    </div>
  );
};

Breadcrumb.propTypes = {
  position: PropTypes.string.isRequired,
  onBack: PropTypes.func, // optional callback
};

export default Breadcrumb;

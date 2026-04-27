import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft } from "lucide-react";

/**
 * Breadcrumb Component
 * Displays navigation trail with back button and current position
 * 
 * @param {Object} props - Component props
 * @param {string} props.position - Current position/page name
 * @param {Function} props.onBack - Optional callback function when back button is clicked
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.positionMap - Custom position mapping object
 */
const Breadcrumb = ({ 
  position, 
  onBack, 
  className = "",
  positionMap = {}
}) => {
  // Default position mapping for common roles
  const defaultPositionMap = {
    Board_Member: "Board Member",
    Vice_Governor: "Vice Governor",
    Vice_Mayor: "Vice Mayor",
    Governor: "Governor",
    Mayor: "Mayor",
    "SP Members": "Sangguniang Panlalawigan Members",
    "SB Members": "Sangguniang Bayan Members"
  };

  // Merge default map with custom map (custom takes precedence)
  const mergedPositionMap = { ...defaultPositionMap, ...positionMap };
  
  // Format the display position
  const displayPosition = mergedPositionMap[position] || position;

  return (
    <nav 
      className={`border-b bg-blue-950 ${className}`}
      aria-label="Breadcrumb"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="inline-flex items-center space-x-1 text-gray-100 transition-colors hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-950 rounded-md px-1 py-0.5"
                aria-label="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <span 
                className="text-gray-400 select-none" 
                aria-hidden="true"
              >
                /
              </span>
            </>
          )}
          <span 
            className="font-medium text-gray-100"
            aria-current={!onBack ? "page" : undefined}
          >
            {displayPosition}
          </span>
        </div>
      </div>
    </nav>
  );
};

Breadcrumb.propTypes = {
  /** Current position/page name */
  position: PropTypes.string.isRequired,
  /** Optional callback function when back button is clicked */
  onBack: PropTypes.func,
  /** Additional CSS classes for customization */
  className: PropTypes.string,
  /** Custom position mapping object for display names */
  positionMap: PropTypes.object
};

Breadcrumb.defaultProps = {
  onBack: null,
  className: "",
  positionMap: {}
};

export default Breadcrumb;
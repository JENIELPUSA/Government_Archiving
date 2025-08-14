// utils/folderUtils.js
export const colors = [
  {
    name: "blue",
    bg: "bg-blue-50 dark:bg-blue-950",
    accent: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-700",
    icon: "text-blue-600 dark:text-blue-400",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-900",
  },
  {
    name: "green",
    bg: "bg-green-50 dark:bg-green-950",
    accent: "bg-green-500",
    border: "border-green-200 dark:border-green-700",
    icon: "text-green-600 dark:text-green-400",
    hover: "hover:bg-green-100 dark:hover:bg-green-900",
  },
  {
    name: "purple",
    bg: "bg-purple-50 dark:bg-purple-950",
    accent: "bg-purple-500",
    border: "border-purple-200 dark:border-purple-700",
    icon: "text-purple-600 dark:text-purple-400",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-900",
  },
  {
    name: "orange",
    bg: "bg-orange-50 dark:bg-orange-950",
    accent: "bg-orange-500",
    border: "border-orange-200 dark:border-orange-700",
    icon: "text-orange-600 dark:text-orange-400",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-900",
  },
  {
    name: "pink",
    bg: "bg-pink-50 dark:bg-pink-950",
    accent: "bg-pink-500",
    border: "border-pink-200 dark:border-pink-700",
    icon: "text-pink-600 dark:text-pink-400",
    hover: "hover:bg-pink-100 dark:hover:bg-pink-900",
  },
  {
    name: "indigo",
    bg: "bg-indigo-50 dark:bg-indigo-950",
    accent: "bg-indigo-500",
    border: "border-indigo-200 dark:border-indigo-700",
    icon: "text-indigo-600 dark:text-indigo-400",
    hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900",
  },
];

export const getColorClasses = (colorName) => {
  return colors.find((c) => c.name === colorName) || colors[0];
};

export const getFileTypeColor = (type) => {
  switch (type) {
    case "ordinance":
    case "pdf":
      return "text-red-500 bg-red-50 dark:bg-red-950";
    case "image":
    case "jpg":
    case "png":
    case "jpeg":
      return "text-green-500 bg-green-50 dark:bg-green-950";
    case "video":
      return "text-purple-500 bg-purple-50 dark:bg-purple-950";
    case "audio":
      return "text-orange-500 bg-orange-50 dark:bg-orange-950";
    case "archive":
    case "zip":
    case "rar":
      return "text-gray-500 bg-gray-50 dark:bg-gray-950";
    default:
      return "text-gray-500 bg-gray-50 dark:bg-gray-950";
  }
};

export const getFileIcon = (type) => {
  switch (type) {
    case "Ordinance":
    case "pdf":
      return "FileText";
    case "image":
    case "jpg":
    case "png":
    case "jpeg":
      return "Image";
    case "video":
      return "Video";
    case "audio":
      return "Music";
    case "archive":
    case "zip":
    case "rar":
      return "Archive";
    default:
      return "File";
  }
};
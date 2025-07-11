// utils/formatUtils.js
export const formatArray = (arr) => {
  if (!arr || arr.length === 0) return "N/A";
  return arr.join(", ");
};

export const formatDate = (dateString, format = "default") => {
  if (!dateString) return "N/A";

  if (format === "yyyy-MM-dd'T'HH:mm") {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Default format
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

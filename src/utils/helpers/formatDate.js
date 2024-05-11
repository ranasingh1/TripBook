export const formatDate = (dateString) => {
    if (!dateString || !dateString.length > 0) return "NA";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };
export const formatDate = (dateString: string | number | Date): string => {
  return new Date(dateString || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

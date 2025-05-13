export function formatDate(date: string) {
  return new Date(date.toString()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

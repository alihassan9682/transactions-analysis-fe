export function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export function riskPillClasses(risk) {
  if (risk === "high") return "bg-red-100 text-red-700";
  if (risk === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

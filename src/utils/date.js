export function getToday() {
  const now = new Date()

  return now.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

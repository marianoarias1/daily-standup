import { useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

function parseLocalDate(dateString) {
  if (!dateString) return undefined

  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatLocalDate(date) {
  if (!date) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function DateRangePicker({ value, onChange, theme }) {
  const [open, setOpen] = useState(false)

  const selectedRange = {
    from: parseLocalDate(value?.start),
    to: parseLocalDate(value?.end)
  }

  function handleSelect(r) {
    if (!r) {
      onChange({ start: null, end: null })
      return
    }

    const start = formatLocalDate(r.from)
    const end = formatLocalDate(r.to)

    onChange({ start, end })

    if (r.from && r.to && r.from.getTime() !== r.to.getTime()) {
      setOpen(false)
    }
  }

  const label = selectedRange.from
    ? `${selectedRange.from.toLocaleDateString("es-AR")} → ${
        selectedRange.to &&
        selectedRange.to.getTime() !== selectedRange.from.getTime()
          ? selectedRange.to.toLocaleDateString("es-AR")
          : "..."
      }`
    : "Seleccionar rango"

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          padding: "6px 10px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px"
        }}
      >
        📅 {label}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 100
          }}
        >
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            showOutsideDays
            style={{
              "--rdp-accent-color": theme.primary,
              "--rdp-background-color": theme.card,
              "--rdp-outline": theme.border,
              "--rdp-selected-color": theme.rangeSelected,
              "--rdp-range_middle-color": theme.text,
              "--rdp-range_middle-background-color": theme.rangeSelected,
              "--rdp-caption-color": theme.text,
              "--rdp-cell-size": "28px"
            }}
          />
        </div>
      )}
    </div>
  )
}
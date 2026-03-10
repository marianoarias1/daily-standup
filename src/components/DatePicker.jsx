import { useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export default function DateRangePicker({ value, onChange, theme }) {

  const [range, setRange] = useState({
    from: value?.start ? new Date(value.start) : undefined,
    to: value?.end ? new Date(value.end) : undefined
  })

  const [open, setOpen] = useState(false)

  function handleSelect(r) {

    if (!r) {
      setRange({ from: undefined, to: undefined })
      onChange({ start: null, end: null })
      return
    }

    setRange(r)

    const start = r.from ? r.from.toISOString().slice(0, 10) : null
    const end = r.to ? r.to.toISOString().slice(0, 10) : null

    onChange({ start, end })

    // cerrar solo si hay rango real
    if (r.from && r.to && r.from.getTime() !== r.to.getTime()) {
      setOpen(false)
    }
  }

  const label = range.from
    ? `${range.from.toLocaleDateString()} → ${range.to && range.to.getTime() !== range.from.getTime()
      ? range.to.toLocaleDateString()
      : "..."
    }`
    : "Seleccionar rango"

  return (
    <div style={{ position: "relative" }}>

      {/* botón */}
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

      {/* popup calendario */}
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
            selected={range}
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
              "--rdp-cell-size": "28px",
            }}
          />
        </div>
      )}
    </div>
  )
}
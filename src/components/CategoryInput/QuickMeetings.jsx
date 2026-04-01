import { QUICK_MEETINGS } from "./categoryInputConstants"

export default function QuickMeetings({ values, onToggle, theme }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "6px",
        marginBottom: "6px"
      }}
    >
      {QUICK_MEETINGS.map(m => {
        const checked = values.some(v => v.text === m)

        return (
          <label
            key={m}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: checked ? theme.chip : "transparent",
              border: `1px solid ${theme.border}`,
              padding: "4px 8px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(m)}
            />
            {m}
          </label>
        )
      })}
    </div>
  )
}

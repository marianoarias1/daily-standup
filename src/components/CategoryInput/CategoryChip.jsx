export default function CategoryChip({ value, index, values, onEdit, onDelete, allowMeta, theme }) {
  return (
    <div
      onClick={() => onEdit(index)}
      style={{
        background: theme.chip,
        color: theme.chipText,
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        cursor: "text",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px"
      }}
    >
      {value.text}

      {allowMeta && value.dueDate && (
        <span style={{ opacity: 0.7 }}>
          📅 {value.dueDate}
        </span>
      )}

      {allowMeta && value.eta && (
        <span style={{ opacity: 0.7 }}>
          ⏳ {value.eta}
        </span>
      )}

      <span
        onClick={e => {
          e.stopPropagation()
          onDelete(values.filter((_, i) => i !== index))
        }}
        style={{ cursor: "pointer", opacity: 0.6 }}
      >
        ❌
      </span>
    </div>
  )
}

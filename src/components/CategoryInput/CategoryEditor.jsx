export default function CategoryEditor({ editingIndex, values, onChange, saveEdit, parseItem, allowMeta, theme }) {
  if (editingIndex === null || !values[editingIndex]) return null

  const item = values[editingIndex]

  const updateField = (field, value) => {
    const copy = [...values]
    copy[editingIndex] = {
      ...copy[editingIndex],
      [field]: value
    }
    onChange(copy)
  }

  return (
    <>
      <textarea
        ref={el => {
          if (el) {
            el.style.height = "auto"
            el.style.height = el.scrollHeight + "px"
          }
        }}
        autoFocus
        value={item.text || ""}
        onChange={e => {
          updateField("text", e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = e.target.scrollHeight + "px"
        }}
        onBlur={() => {
          const parsed = parseItem(values[editingIndex]?.text || "")
          updateField("text", parsed)
        }}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            saveEdit()
          }
        }}
        style={{
          width: "100%",
          marginTop: "6px",
          padding: "4px 8px",
          borderRadius: "12px",
          border: `1px solid ${theme.border}`,
          background: theme.inputBg,
          color: theme.text,
          fontSize: "14px",
          resize: "none",
          overflow: "hidden",
          lineHeight: "1.4",
          boxSizing: "border-box"
        }}
      />

      {allowMeta && (
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <input
            type="date"
            value={item.dueDate || ""}
            onChange={e => updateField("dueDate", e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                saveEdit()
              }
            }}
          />

          <input
            type="text"
            placeholder="Ej: 2 días"
            value={item.eta || ""}
            onChange={e => updateField("eta", e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                saveEdit()
              }
            }}
          />
        </div>
      )}

      <button
        onClick={saveEdit}
        style={{
          marginTop: "6px",
          padding: "4px 8px",
          fontSize: "12px",
          borderRadius: "6px",
          border: `1px solid ${theme.border}`,
          background: theme.btnAddBg,
          color: theme.primary,
          cursor: "pointer"
        }}
      >
        Guardar
      </button>
    </>
  )
}

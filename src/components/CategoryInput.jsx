import { useState } from "react"

const JIRA_BASE = "https://pierce-commerce.atlassian.net/browse/PIERCE-"
const TICKET_CATEGORIES = ["analysis", "tasks", "reworks", "deploys"]

export default function CategoryInput({ label, values, onChange, type, theme }) {
    const [input, setInput] = useState("")
    const [editingIndex, setEditingIndex] = useState(null)

    const isTicketCategory = TICKET_CATEGORIES.includes(type)

    const parseItem = (raw) => {
        if (!isTicketCategory) return raw

        const parts = raw.split(":")
        if (parts.length !== 2) return raw

        const text = parts[0].trim()
        const num = parts[1].trim()

        if (!num.match(/^\d+$/)) return raw

        return `${text} ${JIRA_BASE}${num}`
    }

    const add = () => {
        const parts = input
            .split(",")
            .map(p => p.trim())
            .filter(Boolean)

        if (!parts.length) return

        const newValues = [...values]

        parts.forEach(raw => {
            const parsed = parseItem(raw)
            if (!newValues.includes(parsed)) {
                newValues.push(parsed)
            }
        })

        onChange(newValues)
        setInput("")
    }

    const handleKey = e => {
        if (e.key === "Enter") {
            e.preventDefault()
            add()
        }
    }

    function Chip({ value, index, values, onChange, theme }) {

        return (
            <div
                onClick={() => setEditingIndex(index)}
                style={{
                    background: theme.chip,
                    color: theme.chipText,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    cursor: "text",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                }}
            >
                {value}
                <span
                    onClick={e => {
                        e.stopPropagation()
                        onChange(values.filter((_, i) => i !== index))
                    }}
                    style={{ cursor: "pointer", opacity: 0.6 }}
                >
                    ❌
                </span>
            </div>
        )
    }


    return (
        <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: theme.text }}>{label}</strong>

            <div style={styles.chips}>
                {values.map((ticket, i) => {
                    if (i === editingIndex) return null

                    return (
                        <Chip
                            key={ticket}
                            value={ticket}
                            index={i}
                            values={values}
                            onChange={onChange}
                            parseItem={parseItem}
                            theme={theme}
                        />
                    )
                })}

            </div>

            {editingIndex !== null && (
                <textarea
                    ref={el => {
                        if (el) {
                            el.style.height = "auto"
                            el.style.height = el.scrollHeight + "px"
                        }
                    }}
                    autoFocus
                    value={values[editingIndex]}
                    onChange={e => {
                        const copy = [...values]
                        copy[editingIndex] = e.target.value
                        onChange(copy)

                        e.target.style.height = "auto"
                        e.target.style.height = e.target.scrollHeight + "px"
                    }}
                    onBlur={() => {
                        const parsed = parseItem(values[editingIndex])
                        const copy = [...values]
                        copy[editingIndex] = parsed
                        onChange(copy)
                        setEditingIndex(null)
                    }}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            e.target.blur()
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

            )}


            <div style={styles.row}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={
                        isTicketCategory
                            ? "Ej: Cebra (checkout): 9987"
                            : "Ej: Status front"
                    }
                    style={{
                        ...styles.input,
                        background: theme.inputBg,
                        border: `1px solid ${theme.border}`,
                        color: theme.text
                    }}
                />

                <button
                    onClick={add}
                    style={{
                        ...styles.button,
                        background: theme.btnAddBg
                    }}
                >
                    ➕
                </button>
            </div>
        </div>
    )
}

const styles = {
    chips: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        margin: "6px 0"
    },
    chip: {
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    x: {
        cursor: "pointer",
        fontWeight: "bold"
    },
    row: {
        display: "flex",
        gap: "6px"
    },
    input: {
        flex: 1,
        padding: "6px",
        borderRadius: "6px"
    },
    button: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontWeight: "600"
    }
}

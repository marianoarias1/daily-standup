import { useEffect, useState } from "react"

const JIRA_BASE = "https://pierce-commerce.atlassian.net/browse/PIERCE-"
const TICKET_CATEGORIES = ["analysis", "tasks", "reworks", "deploys"]

export default function CategoryInput({ label, values, onChange, type, theme, day }) {
    const [input, setInput] = useState("")
    const [editingIndex, setEditingIndex] = useState(null)
    const META_CATEGORIES = ["analysis", "tasks", "reworks"]
    const allowMeta = day === "today" && META_CATEGORIES.includes(type)

    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)

    const isTicketCategory = TICKET_CATEGORIES.includes(type)
    const saveEdit = () => {
        if (editingIndex === null) return

        const parsed = parseItem(values[editingIndex].text)

        const copy = [...values]
        copy[editingIndex] = {
            ...copy[editingIndex],
            text: parsed
        }

        onChange(copy)
        setEditingIndex(null)
    }

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
            if (!newValues.some(v => v.text === parsed)) {

                newValues.push({
                    text: parsed,
                    dueDate: null,
                    eta: null
                })
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

    useEffect(() => {
        if (editingIndex === null) return
        if (!isTicketCategory) return

        const value = values[editingIndex]?.text

        if (!value || value.length < 3) {
            setSuggestions([])
            return
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true)

                const res = await fetch(
                    `http://localhost:5173/search?q=${encodeURIComponent(value)}`
                )

                const data = await res.json()

                setSuggestions(data)
            } catch (err) {
                console.error("Error buscando en Jira:", err)
            } finally {
                setLoading(false)
            }
        }, 400)

        return () => clearTimeout(timeout)

    }, [editingIndex, values])

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
                            key={ticket.text + i}
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
                <>
                    <textarea
                        ref={el => {
                            if (el) {
                                el.style.height = "auto"
                                el.style.height = el.scrollHeight + "px"
                            }
                        }}
                        autoFocus
                        value={values[editingIndex].text}
                        onChange={e => {
                            const copy = [...values]
                            copy[editingIndex] = {
                                ...copy[editingIndex],
                                text: e.target.value
                            }
                            onChange(copy)

                            e.target.style.height = "auto"
                            e.target.style.height = e.target.scrollHeight + "px"
                        }}
                        onBlur={() => {
                            const parsed = parseItem(values[editingIndex].text)
                            const copy = [...values]
                            copy[editingIndex] = {
                                ...copy[editingIndex],
                                text: parsed
                            }
                            onChange(copy)
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
                    {
                        allowMeta && (
                            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                                <input
                                    type="date"
                                    value={values[editingIndex].dueDate || ""}
                                    onChange={e => {
                                        const copy = [...values]
                                        copy[editingIndex].dueDate = e.target.value
                                        onChange(copy)
                                    }}
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
                                    value={values[editingIndex].eta || ""}
                                    onChange={e => {
                                        const copy = [...values]
                                        copy[editingIndex].eta = e.target.value
                                        onChange(copy)
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            saveEdit()
                                        }
                                    }}

                                />
                            </div>
                        )

                    }

                    {suggestions.length > 0 && (
                        <div
                            style={{
                                border: `1px solid ${theme.border}`,
                                background: theme.card,
                                borderRadius: "8px",
                                marginTop: "6px",
                                maxHeight: "200px",
                                overflowY: "auto"
                            }}
                        >
                            {suggestions.map(s => (
                                <div
                                    key={s.key}
                                    onClick={() => {
                                        const copy = [...values]

                                        copy[editingIndex] = {
                                            ...copy[editingIndex],
                                            text: `${s.summary} https://pierce-commerce.atlassian.net/browse/${s.key}`
                                        }

                                        onChange(copy)
                                        setSuggestions([])
                                    }}
                                    style={{
                                        padding: "8px",
                                        cursor: "pointer",
                                        borderBottom: `1px solid ${theme.border}`
                                    }}
                                >
                                    <strong>{s.key}</strong> – {s.summary}
                                    <div style={{ fontSize: "12px", opacity: 0.6 }}>
                                        {s.status}
                                    </div>
                                </div>
                            ))}
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

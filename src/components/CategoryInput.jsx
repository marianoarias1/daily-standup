import { useCategoryInput } from "./CategoryInput/useCategoryInput"
import CategoryEditor from "./CategoryInput/CategoryEditor"
import CategoryChip from "./CategoryInput/CategoryChip"
import QuickMeetings from "./CategoryInput/QuickMeetings"
import { META_CATEGORIES, TICKET_CATEGORIES, JIRA_BASE } from "./CategoryInput/categoryInputConstants"

export default function CategoryInput({ label, values, onChange, type, theme, day, tickets, yesterdayTickets }) {
    const {
        input,
        setInput,
        editingIndex,
        setEditingIndex,
        suggestions,
        add,
        handleKey,
        saveEdit,
        toggleMeeting,
        parseItem,
        setSuggestions
    } = useCategoryInput({ values, onChange, type, day, tickets, yesterdayTickets })

    const allowMeta = day === "today" && META_CATEGORIES.includes(type)
    const isMeetings = type === "meetings"
    const isTicketCategory = TICKET_CATEGORIES.includes(type)

    return (
        <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: theme.text }}>{label}</strong>
            {isMeetings && (
                <QuickMeetings
                    values={values}
                    onToggle={toggleMeeting}
                    theme={theme}
                />
            )}

            <div style={styles.chips}>
                {values.map((ticket, i) => {
                    if (i === editingIndex) return null

                    return (
                        <CategoryChip
                            key={ticket.text + i}
                            value={ticket}
                            index={i}
                            values={values}
                            onEdit={setEditingIndex}
                            onDelete={onChange}
                            allowMeta={allowMeta}
                            theme={theme}
                        />
                    )
                })}
            </div>

            <CategoryEditor
                editingIndex={editingIndex}
                values={values}
                onChange={onChange}
                saveEdit={saveEdit}
                parseItem={parseItem}
                allowMeta={allowMeta}
                theme={theme}
            />

            <div style={styles.row}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%"
                }}>
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

                    {suggestions.length > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                width: "100%",
                                marginTop: "4px",
                                border: `1px solid ${theme.border}`,
                                background: theme.card,
                                borderRadius: "8px",
                                maxHeight: "200px",
                                overflowY: "auto",
                                zIndex: 20,
                                boxShadow: "0 6px 18px rgba(0,0,0,0.15)"
                            }}
                        >
                            {suggestions.map(s => (
                                <div
                                    key={s.key}
                                    onClick={() => {
                                        const epicPrefix = s.epicName ? `${s.epicName} - ` : ""
                                        const parsed = `${epicPrefix}${s.summary} ${JIRA_BASE}${s.key.split("-")[1]}`
                                        const newValues = [
                                            ...values,
                                            { text: parsed, dueDate: null, eta: null }
                                        ]
                                        onChange(newValues)
                                        setSuggestions([])
                                        setInput("")
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
                </div>

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

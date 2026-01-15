import { generateSlack } from "../utils/generateSlack"
import CopyButton from "./CopyButton"
import { getToday } from "../utils/date"

export default function SlackPreview({ users, theme }) {
    if (!users || !users.length) return null

    const header = `Resumen Daily Front – ${getToday()} 🚀
\n--------------------------------\n\n`
    const text =  header + users
        .filter(u => u.enabled)
        .map(u => generateSlack(u))
        .join("\n\n------------------------\n\n")

    return (
        <div
            style={{
                ...styles.container,
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.text
            }}
        >
            <div style={styles.header}>
                <h3 style={{ color: theme.text }}>Slack Preview</h3>
                <CopyButton text={text} theme={theme} />
            </div>

            <pre
                style={{
                    ...styles.preview,
                    background: theme.inputBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`
                }}
            >
                {text}
            </pre>
        </div>
    )
}

const styles = {
    container: {
        marginTop: "30px",
        borderRadius: "10px",
        padding: "16px"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
    },
    preview: {
        whiteSpace: "pre-wrap",
        fontSize: "13px",
        lineHeight: "1.4",
        padding: "12px",
        borderRadius: "6px",
        maxHeight: "300px",
        overflow: "auto",
        fontFamily: "monospace"
    }
}

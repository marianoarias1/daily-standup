import { useState } from "react"

export default function CopyButton({ text, theme }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      style={{
        ...styles.button,
        background: copied ? theme.secondary : theme.primary
      }}
    >
      {copied ? "✔ Copiado!" : "📋 Copiar"}
    </button>
  )
}

const styles = {
  button: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background .2s ease"
  }
}

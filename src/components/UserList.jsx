export default function UserList({ users, active, onSelect, toggleUser, theme }) {
  return (
    <div style={styles.container}>
      {users.map((u, index) => {
        const isActive = index === active
        const isDisabled = u.enabled === false

        return (
          <button
            key={u.user}
            onClick={() => onSelect(index)}
            onDoubleClick={() => toggleUser(index)}
            style={{
              ...styles.button,
              background: isActive ? theme.primary : theme.card,
              color: isActive ? "white" : theme.text,
              border: `1px solid ${theme.border}`,
              opacity: isDisabled ? 0.4 : 1,
              textDecoration: isDisabled ? "line-through" : "none"
            }}
          >
            {u.name}
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  button: {
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all .2s ease"
  }
}

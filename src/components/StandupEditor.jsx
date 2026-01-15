import CategoryInput from "./CategoryInput"

const categories = [
  { key: "meetings", label: "Reuniones" },
  { key: "analysis", label: "Análisis" },
  { key: "tasks", label: "Tareas" },
  { key: "reworks", label: "Reworks" },
  { key: "deploys", label: "Deploys" }
]

export default function StandupEditor({ user, onChange, theme }) {
  const update = (day, key, value) => {
    const copy = {
      ...user,
      [day]: {
        ...user[day],
        [key]: value
      }
    }

    onChange(copy)
  }

  return (
    <div>
      <h2 style={{ color: theme.text }}>{user.name}</h2>

      <div style={styles.columns}>
        <div style={styles.block}>
          <h3 style={{ color: theme.text }}>Ayer</h3>

          {categories.map(cat => (
            <CategoryInput
              key={`yesterday-${cat.key}`}
              label={cat.label}
              type={cat.key}
              values={user.yesterday[cat.key]}
              onChange={v => update("yesterday", cat.key, v)}
              theme={theme}
            />
          ))}
        </div>

        <div style={styles.block}>
          <h3 style={{ color: theme.text }}>Hoy</h3>

          {categories.map(cat => (
            <CategoryInput
              key={`today-${cat.key}`}
              label={cat.label}
              type={cat.key}
              values={user.today[cat.key]}
              onChange={v => update("today", cat.key, v)}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  columns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    marginTop: "20px"
  },
  block: {
    display: "flex",
    flexDirection: "column"
  }
}

import CategoryInput from "./CategoryInput"

const categories = [
  { key: "meetings", label: "Reuniones" },
  { key: "analysis", label: "Análisis" },
  { key: "tasks", label: "Tareas" },
  { key: "reworks", label: "Reworks" },
  { key: "deploys", label: "Deploys" }
]

export default function StandupEditor({ user, onChange, theme, titles, setTitles }) {

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
          <input
            value={titles.yesterday}
            onChange={e =>
              setTitles(prev => ({ ...prev, yesterday: e.target.value }))
            }
            style={{
              fontSize: "16px",
              fontWeight: "600",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${theme.border}`,
              color: theme.text
            }}
          />

          {categories.map(cat => (
            <CategoryInput
              key={`yesterday-${cat.key}`}
              label={cat.label}
              type={cat.key}
              day="yesterday"
              values={user.yesterday[cat.key]}
              onChange={v => update("yesterday", cat.key, v)}
              theme={theme}
            />
          ))}
        </div>

        <div style={styles.block}>
          <input
            value={titles.today}
            onChange={e =>
              setTitles(prev => ({ ...prev, today: e.target.value }))
            }
            style={{
              fontSize: "16px",
              fontWeight: "600",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${theme.border}`,
              color: theme.text
            }}
          />

          {categories.map(cat => (
            <CategoryInput
              key={`today-${cat.key}`}
              label={cat.label}
              type={cat.key}
              day="today"
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

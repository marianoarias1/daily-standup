import CategoryInput from "./CategoryInput"
import { useEffect, useState } from "react"
import { normalizeIssuesWithEpic, classifyTickets } from "../services/jiraService"

const categories = [
  { key: "meetings", label: "Reuniones" },
  { key: "analysis", label: "Análisis" },
  { key: "tasks", label: "Tareas" },
  { key: "reworks", label: "Reworks" },
  { key: "deploys", label: "Deploys" }
]

export default function StandupEditor({ user, onChange, theme, titles, setTitles, dateRange }) {
  const [tickets, setTickets] = useState([])
  const [yesterdayTickets, setYesterdayTickets] = useState([])

  useEffect(() => {
    setTickets([])
    setYesterdayTickets([])
  }, [user?.dbId])
  
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

  useEffect(() => {
    if (!user?.id) {
      setTickets([])
      return
    }

    const fetchTickets = async () => {
      try {
        const res = await fetch(
          `https://apipierce.piercecommerce.com/alarm-monitoring/api/jira/sprint/654/tickets?assigneeIds=${encodeURIComponent(user.id)}`
        )

        const data = await res.json()

        const normalizedTickets = await normalizeIssuesWithEpic(data.issues)
        console.log(data.issues)
        setTickets(normalizedTickets)

      } catch (err) {
        console.error("Error trayendo tickets:", err)
        setTickets([])
      }
    }

    fetchTickets()
  }, [user?.id])

  useEffect(() => {
    if (!dateRange?.start || !dateRange?.end) return
    if (!user?.id) return

    async function fetchWorklogs() {
      const res = await fetch(
        `https://apipierce.piercecommerce.com/alarm-monitoring/api/jira/search-date?accountIds=${encodeURIComponent(user?.id)}&startDate=${dateRange.start}&endDate=${dateRange.end}`
      )

      const data = await res.json()

      const filteredIssues = (data.issues || []).filter(issue =>
        issue.fields.worklog?.worklogs?.some(
          w => w.author.accountId === user?.id
        )
      )

      const normalizedYesterdayTickets = await normalizeIssuesWithEpic(filteredIssues)
      setYesterdayTickets(normalizedYesterdayTickets)
    }

    fetchWorklogs()
  }, [dateRange, user?.id])

  useEffect(() => {
    if (!yesterdayTickets?.length) return
    if (user.yesterdayAutoFilled) return

    const classified = classifyTickets(yesterdayTickets)

    const merge = (current = [], incoming = []) => [
      ...current,
      ...incoming.filter(
        t => !current.some(c => c.text === t.text)
      )
    ]

    const copy = {
      ...user,
      yesterdayAutoFilled: true,
      yesterday: {
        ...user.yesterday,
        analysis: merge(user.yesterday.analysis, classified.analysis),
        tasks: merge(user.yesterday.tasks, classified.tasks),
        reworks: merge(user.yesterday.reworks, classified.reworks)
      }
    }

    onChange(copy)
  }, [yesterdayTickets])

  return (
    <div>
      <h2 style={{ color: theme.text }}>{user.name}</h2>

      <div style={styles.columns}>
        <div style={styles.block}>
          <input
            id="yesterday-input"
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
              color: theme.text,
              marginBottom: "20px"
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
              tickets={tickets}
              yesterdayTickets={yesterdayTickets}
            />
          ))}
        </div>

        <div style={styles.block}>
          <input
            id="today-input"
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
              color: theme.text,
              marginBottom: "20px"
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
              tickets={tickets}
              yesterdayTickets={yesterdayTickets}
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

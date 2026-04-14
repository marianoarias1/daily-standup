import CategoryInput from "./CategoryInput"
import { useEffect, useMemo, useState } from "react"
import { normalizeIssuesWithEpic, classifyTickets } from "../services/jiraService"

const categories = [
  { key: "meetings", label: "Reuniones" },
  { key: "analysis", label: "Análisis" },
  { key: "tasks", label: "Tareas" },
  { key: "reworks", label: "Reworks" },
  { key: "deploys", label: "Deploys" }
]

const watchedTodayCategories = [
  { key: "analysis", label: "Análisis" },
  { key: "tasks", label: "Tareas" },
  { key: "reworks", label: "Reworks" }
]

export default function StandupEditor({ user, onChange, theme, titles, setTitles, dateRange }) {
  const [tickets, setTickets] = useState([])
  const [yesterdayTickets, setYesterdayTickets] = useState([])
  const [showDogModal, setShowDogModal] = useState(false)

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

  const missingMetaItems = useMemo(() => {
    return watchedTodayCategories.flatMap(({ key, label }) => {
      const items = user?.today?.[key] || []

      return items
        .map((item, index) => {
          const missingDueDate = !item?.dueDate
          const missingEta = !item?.eta

          if (!missingDueDate && !missingEta) return null

          return {
            id: `${key}-${index}`,
            categoryKey: key,
            categoryLabel: label,
            text: item?.text || "(sin texto)",
            missingDueDate,
            missingEta
          }
        })
        .filter(Boolean)
    })
  }, [user])

  const hasMissingMeta = missingMetaItems.length > 0

  useEffect(() => {
    if (!hasMissingMeta && showDogModal) {
      setShowDogModal(false)
    }
  }, [hasMissingMeta, showDogModal])

  return (
    <div style={{ position: "relative" }}>
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

      {hasMissingMeta && (
        <>
          <button
            type="button"
            className="dog-peek-button"
            onClick={() => setShowDogModal(true)}
            aria-label="Ver items sin fecha o tiempo"
            title="Hay items sin fecha o tiempo"
            style={{
              backgroundImage: "url('/juzagando.jpg')"
            }}
          />

          {showDogModal && (
            <div
              style={styles.modalOverlay}
              onClick={() => setShowDogModal(false)}
            >
              <div
                style={{
                  ...styles.modalCard,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  color: theme.text
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowDogModal(false)}
                  style={{
                    ...styles.modalClose,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    background: theme.inputBg
                  }}
                >
                  ✕
                </button>

                <div style={styles.modalContent}>
                  <img
                    src="/angry.jpg"
                    alt="Perrito alerta"
                    style={styles.modalImage}
                  />

                  <div>
                    <h3 style={{ marginTop: 0 }}>
                      Che… hay items sin fecha y/o tiempo 👀
                    </h3>

                    <p style={{ marginTop: 0, opacity: 0.8 }}>
                      Estos items de <strong>{titles.today}</strong> necesitan completar metadata:
                    </p>

                    <div style={styles.warningList}>
                      {missingMetaItems.map(item => (
                        <div
                          key={item.id}
                          style={{
                            ...styles.warningItem,
                            background: theme.inputBg,
                            border: `1px solid ${theme.border}`
                          }}
                        >
                          <strong>{item.categoryLabel}</strong>

                          <div style={{ marginTop: "4px", wordBreak: "break-word" }}>
                            {item.text}
                          </div>

                          <div style={{ marginTop: "6px", fontSize: "12px", opacity: 0.8 }}>
                            {item.missingDueDate && "📅 Sin fecha de entrega"}
                            {item.missingDueDate && item.missingEta && " • "}
                            {item.missingEta && "⏳ Sin tiempo estimado"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
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
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 100
  },
  modalCard: {
    position: "relative",
    width: "min(920px, 100%)",
    borderRadius: "20px",
    padding: "24px"
  },
  modalClose: {
    position: "absolute",
    top: "14px",
    right: "14px",
    width: "36px",
    height: "40px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalContent: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "24px",
    alignItems: "start"
  },
  modalImage: {
    width: "100%",
    maxWidth: "280px",
    borderRadius: "18px",
    objectFit: "cover"
  },
  warningList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
    maxHeight: "300px",
    overflowY: "auto"
  },
  warningItem: {
    borderRadius: "14px",
    padding: "12px"
  }
}
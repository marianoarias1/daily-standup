import { useEffect, useRef, useState } from "react"
import UserList from "./components/UserList"
import StandupEditor from "./components/StandupEditor"
import SlackPreview from "./components/SlackPreview"
import { themes } from "./theme"
import DateRangePicker from "./components/DatePicker"
import {
  fetchDailySession,
  subscribeToDailyChanges,
  updateSessionFields,
  updateUserEntry
} from "./services/dailySessionService"

const SAVE_DELAY = 700

export default function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("daily-theme") || "light"
  })
  const [sessionId, setSessionId] = useState(null)
  const theme = themes[mode]
  const [sessionUpdatedBy, setSessionUpdatedBy] = useState(null)
  const [editorName, setEditorName] = useState(() => {
    return localStorage.getItem("daily-editor-name") || "Sin nombre"
  })

  useEffect(() => {
    localStorage.setItem("daily-editor-name", editorName)
  }, [editorName])

  const [titles, setTitles] = useState({
    yesterday: "Ayer",
    today: "Hoy"
  })

  const [users, setUsers] = useState([])
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  })
  const [activeUserIndex, setActiveUserIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const [saveStatus, setSaveStatus] = useState("idle")

  const activeUser = users[activeUserIndex] || null
  const activeUserUpdatedBy = activeUser?.updatedBy || null

  const lastEditorMessage =
    saveStatus === "saving"
      ? `Editando como: ${editorName || "Sin nombre"}`
      : activeUserUpdatedBy
        ? `Último cambio en ${activeUser.name} por ${activeUserUpdatedBy}`
        : sessionUpdatedBy
          ? `Último cambio de sesión por ${sessionUpdatedBy}`
          : ""
  const userSaveTimersRef = useRef({})
  const sessionSaveTimerRef = useRef(null)
  const savedFeedbackTimerRef = useRef(null)
  const isHydratingRef = useRef(true)

  const clearSavedFeedbackTimer = () => {
    if (savedFeedbackTimerRef.current) {
      clearTimeout(savedFeedbackTimerRef.current)
      savedFeedbackTimerRef.current = null
    }
  }

  const showSavedState = () => {
    clearSavedFeedbackTimer()
    setSaveStatus("saved")

    savedFeedbackTimerRef.current = setTimeout(() => {
      setSaveStatus("idle")
    }, 1500)
  }

  useEffect(() => {
    localStorage.setItem("daily-theme", mode)
  }, [mode])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const { session, users } = await fetchDailySession()
        setSessionId(session.id)
        setSessionUpdatedBy(session.updated_by || null)

        setTitles({
          yesterday: session.title_yesterday || "Ayer",
          today: session.title_today || "Hoy"
        })

        setDateRange({
          start: session.start_date,
          end: session.end_date
        })

        setUsers(users)
      } catch (err) {
        console.error("Error cargando sesión desde Supabase:", err)
        setSaveStatus("error")
      } finally {
        setLoading(false)
        setTimeout(() => {
          isHydratingRef.current = false
        }, 0)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (!sessionId) return

    const unsubscribe = subscribeToDailyChanges(sessionId, {
      onSessionChange: payload => {
        const row = payload.new
        if (!row) return

        setTitles({
          yesterday: row.title_yesterday || "Ayer",
          today: row.title_today || "Hoy"
        })

        setDateRange({
          start: row.start_date,
          end: row.end_date
        })

        setSessionUpdatedBy(row.updated_by || null)
      },
      onEntryChange: payload => {
        const row = payload.new
        if (!row) return

        setUsers(prev =>
          prev.map(user =>
            user.dbId === row.id
              ? {
                ...user,
                enabled: row.enabled,
                yesterday: row.yesterday,
                today: row.today,
                yesterdayAutoFilled: row.yesterday_autofilled,
                updatedBy: row.updated_by || null
              }
              : user
          )
        )
      }
    })

    return unsubscribe
  }, [sessionId])

  useEffect(() => {
    return () => {
      Object.values(userSaveTimersRef.current).forEach(timerId => {
        clearTimeout(timerId)
      })

      if (sessionSaveTimerRef.current) {
        clearTimeout(sessionSaveTimerRef.current)
      }

      clearSavedFeedbackTimer()
    }
  }, [])

  const scheduleUserSave = user => {
    if (!user?.dbId) return

    const timerKey = user.dbId

    if (userSaveTimersRef.current[timerKey]) {
      clearTimeout(userSaveTimersRef.current[timerKey])
    }

    clearSavedFeedbackTimer()
    setSaveStatus("saving")

    userSaveTimersRef.current[timerKey] = setTimeout(async () => {
      try {
        await updateUserEntry(user, editorName)
        showSavedState()
      } catch (err) {
        console.error("Error guardando usuario:", err)
        setSaveStatus("error")
      } finally {
        delete userSaveTimersRef.current[timerKey]
      }
    }, SAVE_DELAY)
  }

  const scheduleSessionSave = fields => {
    if (sessionSaveTimerRef.current) {
      clearTimeout(sessionSaveTimerRef.current)
    }

    clearSavedFeedbackTimer()
    setSaveStatus("saving")

    sessionSaveTimerRef.current = setTimeout(async () => {
      try {
        if (!sessionId) return
        await updateSessionFields(sessionId, fields, editorName)
        showSavedState()
      } catch (err) {
        console.error("Error guardando sesión:", err)
        setSaveStatus("error")
      }
    }, SAVE_DELAY)
  }

  const updateUser = (index, newUser) => {
    setUsers(prev => {
      const copy = [...prev]
      copy[index] = newUser
      return copy
    })

    if (isHydratingRef.current) return
    scheduleUserSave(newUser)
  }

  const toggleUser = index => {
    const current = users[index]
    if (!current) return

    const updated = {
      ...current,
      enabled: !current.enabled
    }

    updateUser(index, updated)
  }

  const updateTitles = updater => {
    setTitles(prev => {
      const next =
        typeof updater === "function" ? updater(prev) : updater

      if (!isHydratingRef.current) {
        scheduleSessionSave({
          title_yesterday: next.yesterday,
          title_today: next.today,
          start_date: dateRange.start,
          end_date: dateRange.end
        })
      }

      return next
    })
  }

  const updateDateRange = nextRange => {
    setDateRange(nextRange)

    if (isHydratingRef.current) return
    if (!nextRange?.start || !nextRange?.end) return

    scheduleSessionSave({
      title_yesterday: titles.yesterday,
      title_today: titles.today,
      start_date: nextRange.start,
      end_date: nextRange.end
    })
  }

  const saveStatusText = {
    idle: "",
    saving: "Guardando...",
    saved: "Guardado",
    error: "Error al guardar"
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", color: theme.text }}>
        Cargando daily...
      </div>
    )
  }

  return (
    <div style={{ ...styles.page, background: theme.bg }}>
      <div style={{ ...styles.app, color: theme.text }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <button
            onClick={() => setMode(m => (m === "light" ? "dark" : "light"))}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "16px",
              width: "100px"
            }}
          >
            {mode === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <h1
            style={{
              fontWeight: "800",
              alignSelf: "flex-start",
              background: "linear-gradient(300deg, #d14798 40%, #5a4ba6 60%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              lineHeight: "normal",
              marginBottom: "0"
            }}
          >
            Daily Summary Maker
          </h1>
          <input
            value={editorName}
            onChange={e => setEditorName(e.target.value)}
            placeholder="Tu nombre"
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: "6px 10px",
              borderRadius: "8px",
              width: "180px"
            }}
          />
          <div
            style={{
              minHeight: "20px",
              fontSize: "14px",
              fontWeight: "600",
              color:
                saveStatus === "error"
                  ? "#dc2626"
                  : saveStatus === "saved"
                    ? theme.secondary
                    : theme.muted
            }}
          >
            {saveStatusText[saveStatus]}
          </div>

          <div
            style={{
              minHeight: "18px",
              fontSize: "13px",
              color: theme.muted
            }}
          >
            {lastEditorMessage}
          </div>
        </div>

        <UserList
          users={users}
          active={activeUserIndex}
          onSelect={setActiveUserIndex}
          toggleUser={toggleUser}
          theme={theme}
        />

        <DateRangePicker
          value={dateRange}
          onChange={updateDateRange}
          theme={theme}
        />

        {activeUser && (
          <StandupEditor
            user={activeUser}
            onChange={u => updateUser(activeUserIndex, u)}
            theme={theme}
            titles={titles}
            setTitles={updateTitles}
            dateRange={dateRange}
          />
        )}

        <SlackPreview users={users} theme={theme} titles={titles} />
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center"
  },
  app: {
    width: "100%",
    maxWidth: "1200px",
    padding: "20px"
  }
}
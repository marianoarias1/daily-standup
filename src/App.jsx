import { useState, useEffect } from "react"
import { users as baseUsers } from "./data/users"
import UserList from "./components/UserList"
import StandupEditor from "./components/StandupEditor"
import SlackPreview from "./components/SlackPreview"
import { themes } from "./theme"

function createEmptyDay() {
  return {
    meetings: [],
    analysis: [],
    tasks: [],
    reworks: [],
    deploys: []
  }
}

export default function App() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("daily-theme") || "light"
  })
  const theme = themes[mode]
  const [titles, setTitles] = useState({
    yesterday: "Ayer",
    today: "Hoy"
  })

  const [users, setUsers] = useState(
    baseUsers.map(u => ({
      ...u,
      enabled: true,
      yesterday: createEmptyDay(),
      today: createEmptyDay()
    }))
  )


  const [activeUserIndex, setActiveUserIndex] = useState(0)

  const activeUser = users[activeUserIndex]

  const updateUser = (index, newUser) => {
    const copy = [...users]
    copy[index] = newUser
    setUsers(copy)
  }

  const toggleUser = index => {
    const copy = [...users]
    copy[index].enabled = !copy[index].enabled
    setUsers(copy)
  }

  useEffect(() => {
    localStorage.setItem("daily-theme", mode)
  }, [mode])

  return (
    <div style={{ ...styles.page, background: theme.bg }}>
      <div style={{ ...styles.app, color: theme.text }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
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
          <h1 style={{
            fontWeight: "800",
            alignSelf: "flex-start",
            background: "linear-gradient(300deg, #d14798 40%, #5a4ba6 60%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            lineHeight: "normal"
          }}>Daily Summary Maker</h1>
        </div>

        <UserList
          users={users}
          active={activeUserIndex}
          onSelect={setActiveUserIndex}
          toggleUser={toggleUser}
          theme={theme}
        />


        <StandupEditor
          user={activeUser}
          onChange={u => updateUser(activeUserIndex, u)}
          theme={theme}
          titles={titles}
          setTitles={setTitles}
        />

        <SlackPreview users={users}
          theme={theme}
          titles={titles}
        />
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

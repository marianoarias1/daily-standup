import { useEffect, useState } from "react"
import { JIRA_BASE, TICKET_CATEGORIES } from "./categoryInputConstants"

export function useCategoryInput({ values, onChange, type, day, tickets, yesterdayTickets }) {
  const [input, setInput] = useState("")
  const [editingIndex, setEditingIndex] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  const isTicketCategory = TICKET_CATEGORIES.includes(type)

  const parseItem = raw => {
    if (!isTicketCategory) return raw

    const parts = raw.split(":")
    if (parts.length !== 2) return raw

    const text = parts[0].trim()
    const num = parts[1].trim()

    if (!num.match(/^\d+$/)) return raw

    return `${text} ${JIRA_BASE}${num}`
  }

  const saveEdit = () => {
    if (editingIndex === null) return

    const parsed = parseItem(values[editingIndex]?.text || "")
    const copy = [...values]
    copy[editingIndex] = {
      ...copy[editingIndex],
      text: parsed
    }

    onChange(copy)
    setEditingIndex(null)
  }

  const add = () => {
    const parts = input
      .split(",")
      .map(p => p.trim())
      .filter(Boolean)

    if (!parts.length) return

    const newValues = [...values]

    parts.forEach(raw => {
      const parsed = parseItem(raw)
      if (!newValues.some(v => v.text === parsed)) {
        newValues.push({
          text: parsed,
          dueDate: null,
          eta: null
        })
      }
    })

    onChange(newValues)
    setInput("")
  }

  const handleKey = e => {
    if (e.key === "Enter") {
      e.preventDefault()
      add()
    }
  }

  const toggleMeeting = label => {
    const exists = values.some(v => v.text === label)

    if (exists) {
      onChange(values.filter(v => v.text !== label))
    } else {
      onChange([
        ...values,
        { text: label, dueDate: null, eta: null }
      ])
    }
  }

  useEffect(() => {
    if (editingIndex !== null && !values[editingIndex]) {
      setEditingIndex(null)
    }
  }, [values, editingIndex])

  useEffect(() => {
    if (!isTicketCategory) {
      setSuggestions([])
      return
    }

    if (!input || input.length < 2) {
      setSuggestions([])
      return
    }

    const sourceTickets = day === "today" ? tickets : yesterdayTickets
    if (!sourceTickets?.length) {
      setSuggestions([])
      return
    }

    const value = input.toLowerCase()
    const filtered = sourceTickets
      .filter(t =>
        t.summary?.toLowerCase().includes(value) ||
        t.key?.toLowerCase().includes(value) ||
        t.key?.replace("PIERCE-", "").includes(value)
      )
      .slice(0, 5)

    setSuggestions(filtered)
  }, [input, tickets, yesterdayTickets, day, isTicketCategory])

  return {
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
  }
}

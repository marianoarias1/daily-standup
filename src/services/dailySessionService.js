import { supabase } from "../lib/supabaseClient"

function createEmptyDay() {
  return {
    meetings: [],
    analysis: [],
    tasks: [],
    reworks: [],
    deploys: []
  }
}

function normalizeDay(day) {
  return {
    ...createEmptyDay(),
    ...(day || {})
  }
}

function mapEntryToUser(entry) {
  return {
    dbId: entry.id,
    sessionId: entry.session_id,
    name: entry.user_name,
    user: entry.user_slack,
    id: entry.user_external_id,
    enabled: entry.enabled,
    yesterday: normalizeDay(entry.yesterday),
    today: normalizeDay(entry.today),
    yesterdayAutoFilled: entry.yesterday_autofilled,
    updatedBy: entry.updated_by || null
  }
}

export async function getOrCreateTodaySession() {
  const { data, error } = await supabase.rpc("get_or_create_today_daily_session")

  if (error) throw error
  return data
}

export async function fetchDailySession() {
  const session = await getOrCreateTodaySession()

  const { data: entries, error: entriesError } = await supabase
    .from("daily_user_entries")
    .select("*")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })

  if (entriesError) throw entriesError

  return {
    session,
    users: entries.map(mapEntryToUser)
  }
}

export async function updateSessionFields(sessionId, fields, updatedBy) {
  const { error } = await supabase
    .from("daily_sessions")
    .update({
      ...fields,
      updated_by: updatedBy || null
    })
    .eq("id", sessionId)

  if (error) throw error
}

export async function updateUserEntry(user, updatedBy) {
  const payload = {
    enabled: user.enabled,
    yesterday: user.yesterday,
    today: user.today,
    yesterday_autofilled: user.yesterdayAutoFilled,
    updated_by: updatedBy || null
  }

  const { error } = await supabase
    .from("daily_user_entries")
    .update(payload)
    .eq("id", user.dbId)

  if (error) throw error
}

export function subscribeToDailyChanges(sessionId, { onSessionChange, onEntryChange }) {
  const channel = supabase
    .channel(`daily-session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "daily_sessions",
        filter: `id=eq.${sessionId}`
      },
      payload => {
        onSessionChange?.(payload)
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "daily_user_entries",
        filter: `session_id=eq.${sessionId}`
      },
      payload => {
        onEntryChange?.(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
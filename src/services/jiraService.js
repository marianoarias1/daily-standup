const JIRA_BASE = "https://pierce-commerce.atlassian.net/browse/PIERCE-"

export async function fetchIssueByKey(key) {
  try {
    const res = await fetch(
      `https://apipierce.piercecommerce.com/alarm-monitoring/api/jira/issues/${key}`
    )

    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error(`Error trayendo issue ${key}:`, err)
    return null
  }
}

function getEpicNameFromIssue(issue) {
  return (
    issue?.fields?.epic?.name ||
    issue?.fields?.parent?.fields?.summary ||
    null
  )
}

export async function normalizeIssuesWithEpic(issues = []) {
  const cache = new Map()

  const normalized = await Promise.all(
    issues.map(async issue => {
      const parentKey = issue.fields?.parent?.key
      let epicName = issue.fields?.epic?.name || null

      if (parentKey) {
        let parentIssue = cache.get(parentKey)
        if (!parentIssue) {
          parentIssue = await fetchIssueByKey(parentKey)
          cache.set(parentKey, parentIssue)
        }

        const parentIsEpic =
          parentIssue?.fields?.issuetype?.name === "Epic"

        const parentHasParent =
          !!parentIssue?.fields?.parent?.fields?.summary

        if (parentHasParent) {
          epicName = parentIssue.fields.parent.fields.summary
        } else if (parentIsEpic) {
          epicName = parentIssue.fields.summary
        } else {
          epicName =
            issue.fields?.epic?.name ||
            parentIssue?.fields?.summary ||
            issue.fields?.parent?.fields?.summary ||
            null
        }
      }

      return {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name,
        epicName
      }
    })
  )

  return normalized
}

export function buildTicketText(ticket) {
  const url = `${JIRA_BASE}${ticket.key.split("-")[1]}`
  const epicPrefix = ticket.epicName ? `${ticket.epicName} - ` : ""
  return `${epicPrefix}${ticket.summary} ${url}`
}

export function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function classifyTickets(tickets) {
  const result = {
    analysis: [],
    tasks: [],
    reworks: []
  }

  tickets.forEach(t => {
    const summaryNorm = normalizeText(t.summary)

    if (
      summaryNorm.includes("[deploys]") ||
      summaryNorm.includes("[gestion]") ||
      summaryNorm.includes("[soporte]")
    ) {
      return
    }

    const ticketObj = {
      text: buildTicketText(t),
      dueDate: null,
      eta: null
    }

    const isTesting = summaryNorm.includes("[testing]")
    const isAnalysis = summaryNorm.includes("[analisis]")
    const isDev = summaryNorm.includes("[desarrollo]")

    if (isTesting) {
      result.reworks.push(ticketObj)
      return
    }

    if (isAnalysis) {
      result.analysis.push(ticketObj)
      return
    }

    if (isDev) {
      result.tasks.push(ticketObj)
      return
    }
  })

  return result
}

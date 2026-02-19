export function generateSlack(user, titles) {
  const section = (emoji, title, list) => {
    if (!list.length) {
      return `${emoji} ${title}:\n\n`
    }

    const formatted = list
      .map(item => {
        let block = `⚪ ${item.text}`

        if (item.dueDate) {
          block += `\n  ◽ Se entrega: 🗓️ ${item.dueDate}`
        }

        if (item.eta) {
          block += `\n  ◽ Tiempo restante para finalizar ticket: ⌛ ${item.eta}`
        }

        return block
      })
      .join("\n")

    return `${emoji} ${title}:\n${formatted}\n`
  }



  return `@${user.user}
${titles.yesterday} 🎯:
${section("📅", "Reuniones", user.yesterday.meetings)}
${section("🔍", "Análisis", user.yesterday.analysis)}
${section(":meow_code_tap:", "Tareas", user.yesterday.tasks)}
${section(":this_is_fine:", "Reworks", user.yesterday.reworks)}
${section("💻", "Deploys", user.yesterday.deploys)}

${titles.today} 🚀:
${section("📅", "Reuniones", user.today.meetings)}
${section("🔍", "Análisis", user.today.analysis)}
${section(":meow_code_tap:", "Tareas", user.today.tasks)}
${section(":this_is_fine:", "Reworks", user.today.reworks)}
${section("💻", "Deploys", user.today.deploys)}
`
}

export function generateSlack(user) {
  const section = (emoji, title, list) => {
    return `${emoji} ${title}:\n${list.length ? list.join("\n") : ""}\n`
  }

  return `@${user.user}
Ayer :dardo::
${section(":fecha:", "Reuniones", user.yesterday.meetings)}
${section(":lupa:", "Análisis", user.yesterday.analysis)}
${section(":meow_code_tap:", "Tareas", user.yesterday.tasks)}
${section(":this_is_fine:", "Reworks", user.yesterday.reworks)}
${section(":ordenador:", "Deploys", user.yesterday.deploys)}

Hoy :cohete::
${section(":fecha:", "Reuniones", user.today.meetings)}
${section(":lupa:", "Análisis", user.today.analysis)}
${section(":meow_code_tap:", "Tareas", user.today.tasks)}
${section(":this_is_fine:", "Reworks", user.today.reworks)}
${section(":ordenador:", "Deploys", user.today.deploys)}
`
}

export default ({ route, redirect }) => {
  if (route.path !== '/') return

  const supported = ['en', 'es', 'pt', 'ar', 'ja', 'ko']

  const saved = document.cookie
    .split('; ')
    .find(r => r.startsWith('preferred_lang='))
    ?.split('=')[1]

  if (saved && supported.includes(saved)) {
    return redirect(301, `/${saved}/`)
  }

  const langs = navigator.languages || [navigator.language || 'en']
  let target = 'en'
  for (const lang of langs) {
    const code = lang.slice(0, 2).toLowerCase()
    if (supported.includes(code)) { target = code; break }
  }

  document.cookie = `preferred_lang=${target}; path=/; max-age=${60 * 60 * 24 * 365}`
  redirect(301, `/${target}/`)
}

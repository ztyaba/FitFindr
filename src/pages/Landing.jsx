import { useEffect } from "react"

export default function Landing() {
  useEffect(() => {
    const landingUrl = `${import.meta.env.BASE_URL}landing/index-1.html`
    window.location.href = landingUrl
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <p className="text-sm font-medium">Redirecting to the new FitFindr landing experience...</p>
    </div>
  )
}

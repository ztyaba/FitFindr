import Layout from "./Layout.jsx"
import Landing from "./Landing.jsx"

import Browse from "./Browse"
import ProfessionalProfile from "./ProfessionalProfile"
import Versus from "./Versus"
import Calendar from "./Calendar"

import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { createPageUrl } from "@/utils"

const APP_ROUTES = [
  { name: "Browse", element: <Browse /> },
  { name: "ProfessionalProfile", element: <ProfessionalProfile /> },
  { name: "Versus", element: <Versus /> },
  { name: "Calendar", element: <Calendar /> },
]

export default function Pages() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          {APP_ROUTES.map(({ name, element }) => (
            <Route key={name} path={createPageUrl(name)} element={element} />
          ))}
          <Route path="*" element={<Browse />} />
        </Route>
      </Routes>
    </Router>
  )
}

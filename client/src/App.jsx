import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ReportLost from "./pages/ReportLost"
import ReportFound from "./pages/ReportFound"
import SearchItems from "./pages/SearchItems"
import Matches from "./pages/Matches"
import Notifications from "./pages/Notifications"
import PendingClaims from "./pages/PendingClaims"
import MyClaims from "./pages/MyClaims"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/report-lost" element={<ReportLost />} /> 
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/search" element={<SearchItems />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/pending-claims" element={<PendingClaims />} />
          <Route path="/my-claims" element={<MyClaims />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
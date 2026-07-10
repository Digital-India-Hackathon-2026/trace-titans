import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ReportLost from "./pages/ReportLost"
import ReportFound from "./pages/ReportFound"
import SearchItems from "./pages/SearchItems"
import Matches from "./pages/Matches"
function App() {
  return (
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
      </Routes>

    </BrowserRouter>
  )
}

export default App
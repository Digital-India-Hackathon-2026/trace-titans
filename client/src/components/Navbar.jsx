import { useContext, useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Search, LogIn, Home, FilePlus, PackageSearch, LogOut, Bell, Inbox, ClipboardList } from "lucide-react"
import { AuthContext } from "../context/AuthContext"
import API from "../services/api"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, logout } = useContext(AuthContext)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUnreadCount = async () => {
        try {
          const res = await API.get("/notifications")
          const unread = res.data.filter(n => !n.isRead).length
          setUnreadCount(unread)
        } catch (err) {
          console.error("Error fetching unread notification count:", err)
        }
      }
      fetchUnreadCount()

      // Poll every 10 seconds to keep notification badge fresh
      const interval = setInterval(fetchUnreadCount, 10000)
      return () => clearInterval(interval)
    } else {
      setUnreadCount(0)
    }
  }, [isLoggedIn, location])

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <nav className="w-full px-8 py-5 bg-slate-950 text-white border-b border-white/10 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        Trace Titans 🔍
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 hover:text-cyan-400">
          <Home size={18}/>
          Home
        </Link>

        {isLoggedIn && (
          <>
            <Link to="/dashboard" className="hover:text-cyan-400">
              Dashboard
            </Link>

            <Link to="/report-lost" className="flex gap-2 hover:text-cyan-400">
              <FilePlus size={18}/>
              Lost
            </Link>

            <Link to="/report-found" className="flex gap-2 hover:text-cyan-400">
              <PackageSearch size={18}/>
              Found
            </Link>

            <Link to="/search" className="flex gap-2 hover:text-cyan-400">
              <Search size={18}/>
              AI Search
            </Link>

            <Link to="/my-claims" className="flex gap-2 hover:text-cyan-400" title="My Claims Sent">
              <ClipboardList size={18}/>
              My Claims
            </Link>

            <Link to="/pending-claims" className="flex gap-2 hover:text-cyan-400" title="Pending Claims Received">
              <Inbox size={18}/>
              Pending Claims
            </Link>

            <Link to="/notifications" className="relative flex items-center p-1.5 hover:text-cyan-400 transition" title="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut size={18}/>
              Logout
            </button>
          </>
        )}

        {!isLoggedIn && (
          <Link 
            to="/login"
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-4 py-2 rounded-xl font-bold transition"
          >
            <LogIn size={18}/>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
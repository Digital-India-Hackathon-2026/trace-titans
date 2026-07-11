import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check, Loader2, ArrowLeft } from "lucide-react"
import API from "../services/api"

function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications")
      setNotifications(res.data)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to fetch notifications.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const handleViewClaim = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id)
    }
    navigate("/pending-claims")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
          <Bell className="text-cyan-400" size={36} /> Notifications
        </h1>
        <p className="text-gray-400 mb-10">
          Stay updated on claim requests and matching activities for your reported items.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <span className="text-gray-400">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl text-gray-400">
            No notifications yet. You're all caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  notification.isRead 
                    ? "bg-white/5 border-white/5 opacity-70" 
                    : "bg-white/10 border-cyan-500/30 shadow-lg shadow-cyan-500/5"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🔔</span>
                    <h3 className="font-bold text-lg text-white">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="bg-cyan-500 text-black text-xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-300 text-sm leading-relaxed">
                    {notification.message}
                  </p>
                  <span className="block mt-2 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-200 transition"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleViewClaim(notification)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition shadow-md shadow-cyan-400/10"
                  >
                    View Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import API from "../services/api";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleViewClaim = async (notification) => {
    // Automatically mark read when viewing
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    // Navigate to pending-claims (since this notification is for finder reviewing received claims)
    navigate("/pending-claims");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Bell className="text-cyan-400" size={36} />
              Notifications
            </h1>
            <p className="text-gray-400 mt-2">
              Stay updated on claim requests for your reported found items.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-xl text-center mb-5 text-sm flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-cyan-400" size={40} />
              <span className="text-gray-400">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              🔔 You don't have any notifications yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-5 rounded-xl border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                    n.isRead
                      ? "bg-white/5 border-white/5 opacity-75"
                      : "bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${n.isRead ? "bg-gray-600" : "bg-cyan-400 animate-pulse"}`} />
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="bg-cyan-400 text-black text-xs px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm">{n.message}</p>
                    <span className="text-xs text-gray-500 block mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white transition"
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    {n.type === "claim" && (
                      <button
                        onClick={() => handleViewClaim(n)}
                        className="px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg hover:scale-105 transition flex items-center gap-1.5 text-sm"
                      >
                        View Claim
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;

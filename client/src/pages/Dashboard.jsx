import { useState, useEffect, useContext } from "react"
import { Search, FilePlus, PackageSearch } from "lucide-react"
import { useNavigate } from "react-router-dom"
import RewardCard from "../components/RewardCard"
import API from "../services/api"
import { AuthContext } from "../context/AuthContext"

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await API.get("/items")
        setItems(res.data)
      } catch (err) {
        console.error("Failed to fetch items:", err)
      } finally {
        setLoading(false)
      }
    }
    const fetchDbStatus = async () => {
      try {
        const res = await API.get("/db-status")
        setDbStatus(res.data)
      } catch (err) {
        console.error("Failed to fetch DB status:", err)
      }
    }
    fetchItems()
    fetchDbStatus()
  }, [])

  const getItemEmoji = (category, title) => {
    const text = `${category} ${title}`.toLowerCase()
    if (text.includes("bag") || text.includes("backpack")) return "🎒"
    if (text.includes("phone") || text.includes("mobile")) return "📱"
    if (text.includes("card") || text.includes("id") || text.includes("aadhaar") || text.includes("license")) return "🪪"
    if (text.includes("wallet") || text.includes("purse")) return "👛"
    if (text.includes("key")) return "🔑"
    if (text.includes("laptop") || text.includes("macbook")) return "💻"
    if (text.includes("watch")) return "⌚"
    return "📦"
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-3">
            Welcome Back, {user?.name || "User"} 👋
          </h1>
          <p className="text-lg text-gray-300">
            Manage your lost and found items easily with AI assistance.
          </p>
        </div>
        
        {dbStatus && (
          <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-sm font-semibold shadow-lg backdrop-blur-md transition-all ${
            dbStatus.useInMemoryDB 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${dbStatus.useInMemoryDB ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            Database Mode: <span className="font-bold">{dbStatus.dbMode}</span>
          </div>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/report-lost")}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition cursor-pointer"
        >
          <FilePlus size={40} />
          <h2 className="text-2xl font-bold mt-4">
            Report Lost Item
          </h2>
          <p className="mt-2">
            Tell us about your missing item and find possible matches.
          </p>
        </div>

        <div
          onClick={() => navigate("/report-found")}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition cursor-pointer"
        >
          <PackageSearch size={40} />
          <h2 className="text-2xl font-bold mt-4">
            Report Found Item
          </h2>
          <p className="mt-2">
            Help return items by reporting what you found.
          </p>
        </div>

        <div
          onClick={() => navigate("/search")}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition cursor-pointer"
        >
          <Search size={40} />
          <h2 className="text-2xl font-bold mt-4">
            Search Matches
          </h2>
          <p className="mt-2">
            AI finds similar lost and found items.
          </p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-12 bg-white/10 border border-white/10 backdrop-blur-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-5">
          Recent Reports
        </h2>

        {loading ? (
          <div className="text-center py-4 text-gray-400">Loading reports...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No items reported yet.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.slice(0, 6).map((item) => (
              <div key={item._id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
                <span className="text-lg">
                  {getItemEmoji(item.category, item.title)} {item.title} - <span className={item.status === "Lost" ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>{item.status}</span>
                </span>
                <span className="text-sm text-gray-400">
                  {item.location} ({new Date(item.date).toLocaleDateString()})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reward Points */}
      <RewardCard />
    </div>
  )
}

export default Dashboard
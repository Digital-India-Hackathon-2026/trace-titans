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
    fetchItems()
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
      <h1 className="text-4xl font-bold mb-3">
        Welcome Back, {user?.name || "User"} 👋
      </h1>

      <p className="mb-10 text-lg">
        Manage your lost and found items easily with AI assistance.
      </p>

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
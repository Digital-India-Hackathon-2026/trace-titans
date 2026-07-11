import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Loader2, Check } from "lucide-react"
import API from "../services/api"

function Matches() {
  const location = useLocation()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [claimed, setClaimed] = useState({})
  const [claimError, setClaimError] = useState({})

  const { queryText, status } = location.state || {}

  useEffect(() => {
    if (!queryText) {
      setError("No search parameters provided. Please start from the search page.")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const [matchesRes, claimsRes] = await Promise.all([
          API.post("/items/search-matches", { queryText, status }),
          API.get("/claims/my-sent").catch(() => ({ data: [] }))
        ])
        
        setMatches(matchesRes.data)
        
        const claimedMap = {}
        const sentClaims = claimsRes.data || []
        
        matchesRes.data.forEach((match, index) => {
          const hasClaim = sentClaims.some(
            c => (c.foundItem?._id === match._id || c.foundItem === match._id)
          )
          if (hasClaim) {
            claimedMap[index] = "success"
          }
        })
        setClaimed(claimedMap)
      } catch (err) {
        console.error("Match error:", err)
        setError("Failed to fetch matching reports from the server.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [queryText, status])

  const handleContactClick = (index) => {
    setClaimed(prev => ({
      ...prev,
      [index]: "confirm"
    }))
  }

  const handleClaimInitiated = async (index, foundItemId) => {
    setClaimed(prev => ({
      ...prev,
      [index]: "submitting"
    }))
    setClaimError(prev => ({
      ...prev,
      [index]: ""
    }))
    try {
      await API.post("/claims", { foundItem: foundItemId })
      setClaimed(prev => ({
        ...prev,
        [index]: "success"
      }))
    } catch (err) {
      console.error("Claim error:", err)
      const msg = err.response?.data?.message || "Failed to initiate claim request."
      setClaimError(prev => ({
        ...prev,
        [index]: msg
      }))
      setClaimed(prev => ({
        ...prev,
        [index]: "confirm"
      }))
    }
  }

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
      <button 
        onClick={() => navigate("/search")}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to Search
      </button>

      <h1 className="text-4xl font-bold mb-3">
        🤖 AI Match Results
      </h1>

      <p className="text-lg mb-10 text-gray-300">
        AI analyzed lost and found reports to find possible matches.
      </p>

      {queryText && (
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8">
          <span className="text-sm text-cyan-400 font-bold uppercase tracking-wider">Search Description:</span>
          <p className="mt-2 text-gray-200 italic">"{queryText}"</p>
          <div className="mt-3 text-xs text-gray-400">
            Searching for: <span className="font-bold text-gray-200">{status === "Lost" ? "FOUND reports" : "LOST reports"}</span>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-5">
          Possible Matches Found
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <span className="text-gray-400">Analyzing reports...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <AlertTriangle className="text-red-400" size={40} />
            <span className="text-red-300">{error}</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No matching items found in the database.
          </div>
        ) : (
          <div className="space-y-5">
            {matches.map((match, index) => {
              const item = match
              const score = match.score
              return (
                <div
                  key={index}
                  className="bg-white/10 rounded-xl p-5 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {getItemEmoji(item.category, item.title)} {item.title}
                    </h3>
                    <p className="mt-2 text-gray-300 text-sm">
                      {item.description}
                    </p>
                    <p className="mt-2 text-gray-400 text-sm">
                      📍 Location: <span className="text-gray-200">{item.location}</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      📅 Date: <span className="text-gray-200">{new Date(item.date).toLocaleDateString()}</span>
                    </p>

                    <div className="mt-4 max-w-md">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Match Confidence:</span>
                        <span className="text-cyan-400 font-bold">{score}% Match</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {item.image && (
                    <div className="w-24 h-24 border border-white/15 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    {claimed[index] === "success" && (
                      <button 
                        className="px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 bg-green-500 text-white cursor-not-allowed opacity-80"
                        disabled
                      >
                        <Check size={18} />
                        Claim Initiated
                      </button>
                    )}
                    {claimed[index] === "submitting" && (
                      <button 
                        className="px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 bg-cyan-400 text-black animate-pulse cursor-wait"
                        disabled
                      >
                        <Loader2 className="animate-spin" size={18} />
                        Submitting...
                      </button>
                    )}
                    {claimed[index] === "confirm" && (
                      <button 
                        onClick={() => handleClaimInitiated(index, item._id)}
                        className="px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 animate-bounce"
                      >
                        Claim Initiated
                      </button>
                    )}
                    {(!claimed[index] || (claimed[index] !== "success" && claimed[index] !== "submitting" && claimed[index] !== "confirm")) && (
                      <button 
                        onClick={() => handleContactClick(index)}
                        className="px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 bg-white text-black hover:scale-105"
                      >
                        Contact Finder
                      </button>
                    )}
                    {claimed[index] === "success" && (
                      <span className="text-green-400 text-xs font-semibold mt-1">Claim request has been sent successfully.</span>
                    )}
                    {claimError[index] && (
                      <span className="text-red-400 text-xs font-semibold mt-1 max-w-[200px] text-right">{claimError[index]}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Matches
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
  const [userItems, setUserItems] = useState([])
  const [showClaimConfirm, setShowClaimConfirm] = useState({})
  const [selectedUserItem, setSelectedUserItem] = useState({})
  const [claimStatus, setClaimStatus] = useState({})

  const { queryText, status } = location.state || {}

  useEffect(() => {
    if (!queryText) {
      setError("No search parameters provided. Please start from the search page.")
      setLoading(false)
      return
    }

    const fetchMatches = async () => {
      try {
        const res = await API.post("/items/search-matches", { queryText, status })
        setMatches(res.data)
      } catch (err) {
        console.error("Match error:", err)
        setError("Failed to fetch matching reports from the server.")
      } finally {
        setLoading(false)
      }
    }

    const fetchUserItems = async () => {
      try {
        const res = await API.get("/items")
        setUserItems(res.data)
      } catch (err) {
        console.error("Failed to fetch user items:", err)
      }
    }

    fetchMatches()
    fetchUserItems()
  }, [queryText, status])

  const getOppositeUserItems = (matchedItemStatus) => {
    const targetStatus = matchedItemStatus === "Found" ? "Lost" : "Found"
    return userItems.filter(i => i.status === targetStatus)
  }

  const handleContact = (index, matchedItemStatus) => {
    const oppositeItems = getOppositeUserItems(matchedItemStatus)
    if (oppositeItems.length > 0 && !selectedUserItem[index]) {
      setSelectedUserItem(prev => ({
        ...prev,
        [index]: oppositeItems[0]._id
      }))
    }
    setShowClaimConfirm(prev => ({
      ...prev,
      [index]: true
    }))
  }

  const handleInitiateClaim = async (index, matchedItem) => {
    const matchedItemId = matchedItem._id
    const userItemId = selectedUserItem[index]

    if (!userItemId) {
      setClaimStatus(prev => ({
        ...prev,
        [index]: { error: true, message: "Please select an item to claim with." }
      }))
      return
    }

    setClaimStatus(prev => ({
      ...prev,
      [index]: { loading: true }
    }))

    const isMatchedItemFound = matchedItem.status === "Found"
    const lostItemId = isMatchedItemFound ? userItemId : matchedItemId
    const foundItemId = isMatchedItemFound ? matchedItemId : userItemId

    try {
      await API.post("/claims", { lostItemId, foundItemId })
      setClaimStatus(prev => ({
        ...prev,
        [index]: { success: true, message: "Claim request has been sent successfully." }
      }))
    } catch (err) {
      console.error("Claim error:", err)
      setClaimStatus(prev => ({
        ...prev,
        [index]: { error: true, message: err.response?.data?.message || "Failed to initiate claim." }
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
              const oppositeItems = getOppositeUserItems(item.status)
              const statusObj = claimStatus[index] || {}
              const isClaimed = statusObj.success

              return (
                <div
                  key={index}
                  className="bg-white/10 rounded-xl p-5 border border-white/5 flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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

                    <div className="shrink-0">
                      {!showClaimConfirm[index] ? (
                        <button 
                          onClick={() => handleContact(index, item.status)}
                          className="px-5 py-2.5 rounded-lg font-bold bg-white text-black hover:scale-105 transition cursor-pointer"
                        >
                          Contact Finder
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleInitiateClaim(index, item)}
                          className={`px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer ${
                            isClaimed 
                              ? 'bg-green-500 text-white cursor-default hover:scale-100' 
                              : 'bg-cyan-400 text-black hover:scale-105'
                          }`}
                          disabled={isClaimed || statusObj.loading}
                        >
                          {statusObj.loading ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : isClaimed ? (
                            <>
                              <Check size={18} />
                              Claim Initiated
                            </>
                          ) : (
                            "Claim Initiated"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {showClaimConfirm[index] && (
                    <div className="mt-4 bg-slate-900/60 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex-1 w-full">
                        {oppositeItems.length === 0 ? (
                          <div className="text-sm text-amber-400 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            <span>
                              You need to report a {item.status === "Found" ? "Lost" : "Found"} item first. 
                              <button 
                                onClick={() => navigate(item.status === "Found" ? "/report-lost" : "/report-found")} 
                                className="text-cyan-400 font-bold ml-1 hover:underline cursor-pointer"
                              >
                                Report now
                              </button>
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
                            <span className="text-sm text-gray-400 font-medium shrink-0">
                              Link to your {item.status === "Found" ? "lost" : "found"} report:
                            </span>
                            <select
                              value={selectedUserItem[index] || ""}
                              onChange={(e) => setSelectedUserItem(prev => ({ ...prev, [index]: e.target.value }))}
                              disabled={isClaimed}
                              className="bg-slate-950 border border-white/10 text-white rounded-lg p-2 outline-none w-full max-w-md text-sm cursor-pointer"
                            >
                              {oppositeItems.map(userItem => (
                                <option key={userItem._id} value={userItem._id}>
                                  {getItemEmoji(userItem.category, userItem.title)} {userItem.title} ({new Date(userItem.date).toLocaleDateString()})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {statusObj.message && (
                        <div className={`text-sm font-bold shrink-0 ${statusObj.error ? 'text-red-400' : 'text-green-400'}`}>
                          {statusObj.message}
                        </div>
                      )}
                    </div>
                  )}
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
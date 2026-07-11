import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, Send } from "lucide-react"
import API from "../services/api"

function MyClaims() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchClaims = async () => {
    try {
      const res = await API.get("/claims/my-sent")
      setClaims(res.data)
    } catch (err) {
      console.error("Failed to fetch claims:", err)
      setError("Failed to fetch your claim requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
          📤 Sent Claim Requests
        </h1>
        <p className="text-gray-400 mb-10">
          Track the status of your claims for items matching your lost reports.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <span className="text-gray-400">Loading your claims...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl text-gray-400">
            You haven't initiated any claims yet.
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <div 
                key={claim._id} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6"
              >
                {/* Header details */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                      Finder
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {claim.finder?.name || "Finder User"} ({claim.finder?.email})
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-400">
                      Sent On: {new Date(claim.createdAt).toLocaleString()}
                    </span>
                    {claim.status !== "Pending" && (
                      <span className="block text-xs text-gray-500">
                        Updated On: {new Date(claim.updatedAt || claim.createdAt).toLocaleString()}
                      </span>
                    )}
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                      claim.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                      claim.status === "Accepted" ? "bg-green-500/10 text-green-400 border border-green-500/30" :
                      "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>

                {/* Items comparison block */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Lost Item (Owned by Claimant/Current User) */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-2">
                      Your Lost Item
                    </span>
                    {claim.lostItem ? (
                      <div>
                        <h4 className="font-bold text-lg">{claim.lostItem.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{claim.lostItem.description}</p>
                        <div className="mt-3 text-xs text-gray-400 space-y-1">
                          <p>📍 Location: {claim.lostItem.location}</p>
                          <p>📅 Date Lost: {new Date(claim.lostItem.date).toLocaleDateString()}</p>
                        </div>
                        {claim.lostItem.image && (
                          <div className="mt-3 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                            <img src={claim.lostItem.image} alt={claim.lostItem.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Item details unavailable</span>
                    )}
                  </div>

                  {/* Found Item (Owned by Finder) */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider block mb-2">
                      Matched Found Item
                    </span>
                    {claim.foundItem ? (
                      <div>
                        <h4 className="font-bold text-lg">{claim.foundItem.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{claim.foundItem.description}</p>
                        <div className="mt-3 text-xs text-gray-400 space-y-1">
                          <p>📍 Location: {claim.foundItem.location}</p>
                          <p>📅 Date Found: {new Date(claim.foundItem.date).toLocaleDateString()}</p>
                        </div>
                        {claim.foundItem.image && (
                          <div className="mt-3 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                            <img src={claim.foundItem.image} alt={claim.foundItem.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Item details unavailable</span>
                    )}
                  </div>
                </div>

                {/* Explanation text based on status */}
                <div className="mt-2 text-sm text-gray-400 border-t border-white/5 pt-4">
                  {claim.status === "Pending" && (
                    <p>⏳ The finder has been notified and is currently reviewing your claim request. We will update you here when they take action.</p>
                  )}
                  {claim.status === "Accepted" && (
                    <p>🎉 The finder has accepted your claim! Please reach out to them at <span className="text-cyan-400 font-semibold">{claim.finder?.email}</span> to coordinate return details.</p>
                  )}
                  {claim.status === "Rejected" && (
                    <p>❌ The finder reviewed and rejected your claim request. If you believe this is a mistake, you can contact support or verify your item details.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyClaims

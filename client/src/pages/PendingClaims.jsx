import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Check, X, Loader2, ArrowLeft, ShieldAlert } from "lucide-react"
import API from "../services/api"

function PendingClaims() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState({})

  const fetchClaims = async () => {
    try {
      const res = await API.get("/claims/my-received")
      setClaims(res.data)
    } catch (err) {
      console.error("Failed to fetch claims:", err)
      setError("Failed to fetch claim requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  const handleAccept = async (claimId) => {
    setActionLoading(prev => ({ ...prev, [claimId]: "accept" }))
    try {
      await API.put(`/claims/${claimId}/accept`)
      setClaims(prev =>
        prev.map(c => (c._id === claimId ? { ...c, status: "Accepted" } : c))
      )
    } catch (err) {
      console.error("Failed to accept claim:", err)
      alert(err.response?.data?.message || "Failed to accept the claim.")
    } finally {
      setActionLoading(prev => ({ ...prev, [claimId]: null }))
    }
  }

  const handleReject = async (claimId) => {
    setActionLoading(prev => ({ ...prev, [claimId]: "reject" }))
    try {
      await API.put(`/claims/${claimId}/reject`)
      setClaims(prev =>
        prev.map(c => (c._id === claimId ? { ...c, status: "Rejected" } : c))
      )
    } catch (err) {
      console.error("Failed to reject claim:", err)
      alert(err.response?.data?.message || "Failed to reject the claim.")
    } finally {
      setActionLoading(prev => ({ ...prev, [claimId]: null }))
    }
  }

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
          📥 Received Claim Requests
        </h1>
        <p className="text-gray-400 mb-10">
          Review claim requests from users who believe your found items belong to them.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-cyan-400" size={40} />
            <span className="text-gray-400">Loading claim requests...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl text-gray-400">
            No claim requests received yet.
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <div 
                key={claim._id} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6"
              >
                {/* Header info */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                      Claimant
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {claim.claimant?.name || "Anonymous User"} ({claim.claimant?.email})
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-400">
                      Received On: {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-bold ${
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
                  {/* Found Item (Owned by Finder) */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider block mb-2">
                      Your Found Item
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

                  {/* Lost Item (Owned by Claimant) */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-2">
                      Claimant's Lost Item
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
                </div>

                {/* Actions */}
                {claim.status === "Pending" && (
                  <div className="flex justify-end gap-4 mt-2">
                    <button
                      onClick={() => handleReject(claim._id)}
                      disabled={actionLoading[claim._id]}
                      className="px-5 py-2.5 rounded-xl font-bold bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/30 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading[claim._id] === "reject" ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <X size={18} />
                      )}
                      Reject Claim
                    </button>
                    <button
                      onClick={() => handleAccept(claim._id)}
                      disabled={actionLoading[claim._id]}
                      className="px-5 py-2.5 rounded-xl font-bold bg-green-500 text-black hover:bg-green-400 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading[claim._id] === "accept" ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Check size={18} />
                      )}
                      Accept Claim
                    </button>
                  </div>
                )}

                {claim.status !== "Pending" && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 justify-end mt-2">
                    <span>This claim has been</span>
                    <span className={`font-bold ${claim.status === "Accepted" ? "text-green-400" : "text-red-400"}`}>
                      {claim.status.toLowerCase()}
                    </span>
                    <span>and the decision is final.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingClaims

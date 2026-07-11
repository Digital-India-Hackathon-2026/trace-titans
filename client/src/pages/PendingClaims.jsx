import { useState, useEffect } from "react";
import { Check, X, ShieldAlert, Mail, User, Calendar, Loader2 } from "lucide-react";
import API from "../services/api";

function PendingClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchClaims = async () => {
    try {
      const res = await API.get("/claims/my-received");
      setClaims(res.data);
    } catch (err) {
      console.error("Failed to fetch received claims:", err);
      setError("Failed to load claim requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAccept = async (claimId) => {
    setError("");
    setSuccessMsg("");
    try {
      await API.put(`/claims/${claimId}/accept`);
      setSuccessMsg("Claim request accepted successfully! Claimant contact details are now visible.");
      // Refresh claims list to show updated status and email
      fetchClaims();
    } catch (err) {
      console.error("Failed to accept claim:", err);
      setError(err.response?.data?.message || "Failed to accept claim request.");
    }
  };

  const handleReject = async (claimId) => {
    setError("");
    setSuccessMsg("");
    try {
      await API.put(`/claims/${claimId}/reject`);
      setSuccessMsg("Claim request has been rejected.");
      fetchClaims();
    } catch (err) {
      console.error("Failed to reject claim:", err);
      setError(err.response?.data?.message || "Failed to reject claim request.");
    }
  };

  const getItemEmoji = (category, title) => {
    const text = `${category} ${title}`.toLowerCase();
    if (text.includes("bag") || text.includes("backpack")) return "🎒";
    if (text.includes("phone") || text.includes("mobile")) return "📱";
    if (text.includes("card") || text.includes("id") || text.includes("aadhaar") || text.includes("license")) return "🪪";
    if (text.includes("wallet") || text.includes("purse")) return "👛";
    if (text.includes("key")) return "🔑";
    if (text.includes("laptop") || text.includes("macbook")) return "💻";
    if (text.includes("watch")) return "⌚";
    return "📦";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            📥 Received Claims
          </h1>
          <p className="text-gray-400 mt-2">
            Review claim requests for items you reported finding. Verify ownership before accepting.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-center mb-6 text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-xl text-center mb-6 text-sm">
            {successMsg}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-cyan-400" size={40} />
              <span className="text-gray-400">Loading received claims...</span>
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No claim requests received yet.
            </div>
          ) : (
            <div className="space-y-6">
              {claims.map((claim) => (
                <div
                  key={claim._id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-6"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/10 pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                          Claim ID: {claim._id.slice(-6)}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          claim.status === "Pending" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          claim.status === "Accepted" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-xs">
                        <Calendar size={14} />
                        <span>Submitted on {new Date(claim.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="text-cyan-400" />
                      <span className="text-sm font-semibold">Claimant: {claim.claimant?.name || "Unknown"}</span>
                    </div>
                  </div>

                  {/* Lost and Found Items Side-by-Side Comparison */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Lost Item Details */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
                      <h4 className="text-xs text-red-400 font-bold uppercase tracking-wider mb-3">Their Lost Item:</h4>
                      {claim.lostItem ? (
                        <div>
                          <div className="flex items-center gap-2 text-lg font-bold">
                            <span>{getItemEmoji(claim.lostItem.category, claim.lostItem.title)}</span>
                            <span>{claim.lostItem.title}</span>
                          </div>
                          <p className="text-sm text-gray-300 mt-2">{claim.lostItem.description}</p>
                          <div className="text-xs text-gray-400 mt-3 space-y-1">
                            <div>📍 Location: {claim.lostItem.location}</div>
                            <div>📅 Date: {new Date(claim.lostItem.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Lost Item details unavailable</span>
                      )}
                    </div>

                    {/* Found Item Details */}
                    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
                      <h4 className="text-xs text-green-400 font-bold uppercase tracking-wider mb-3">Your Found Item:</h4>
                      {claim.foundItem ? (
                        <div>
                          <div className="flex items-center gap-2 text-lg font-bold">
                            <span>{getItemEmoji(claim.foundItem.category, claim.foundItem.title)}</span>
                            <span>{claim.foundItem.title}</span>
                          </div>
                          <p className="text-sm text-gray-300 mt-2">{claim.foundItem.description}</p>
                          <div className="text-xs text-gray-400 mt-3 space-y-1">
                            <div>📍 Location: {claim.foundItem.location}</div>
                            <div>📅 Date: {new Date(claim.foundItem.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Found Item details unavailable</span>
                      )}
                    </div>
                  </div>

                  {/* Actions / Contact Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 gap-4">
                    <div>
                      {claim.status === "Accepted" ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Mail size={16} />
                          <span className="text-sm font-semibold">Contact Email: {claim.claimant?.email}</span>
                        </div>
                      ) : claim.status === "Rejected" ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <ShieldAlert size={16} />
                          <span>Claim request rejected</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Contact details will be exchanged only after you accept this claim.
                        </div>
                      )}
                    </div>

                    {claim.status === "Pending" && (
                      <div className="flex gap-3 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => handleReject(claim._id)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-lg border border-red-500/20 transition flex items-center justify-center gap-2 text-sm"
                        >
                          <X size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleAccept(claim._id)}
                          className="flex-1 sm:flex-initial px-5 py-2.5 bg-green-500 text-white font-bold rounded-lg hover:scale-105 transition flex items-center justify-center gap-2 text-sm"
                        >
                          <Check size={16} />
                          Accept
                        </button>
                      </div>
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

export default PendingClaims;

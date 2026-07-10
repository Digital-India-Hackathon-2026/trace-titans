import { useState } from "react"
import { Search, Sparkles, HelpCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

function SearchItems() {
  const navigate = useNavigate()
  const [queryText, setQueryText] = useState("")
  const [status, setStatus] = useState("Lost")
  const [error, setError] = useState("")

  const handleFindMatches = (e) => {
    e.preventDefault()
    if (!queryText.trim()) {
      setError("Please describe the item first")
      return
    }
    setError("")
    navigate("/matches", { state: { queryText, status } })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Sparkles 
            size={50}
            className="mx-auto text-cyan-400 animate-pulse"
          />
          <h1 className="text-4xl font-bold mt-4">
            AI Item Matching 🤖
          </h1>
          <p className="text-gray-400 mt-3">
            Describe your item in natural language and let our AI compute matching confidence with reports in our database.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-xl text-center mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleFindMatches} className="space-y-5">
            <div className="flex gap-6 mb-4 justify-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Lost"
                  checked={status === "Lost"}
                  onChange={() => setStatus("Lost")}
                  className="accent-cyan-400 h-4 w-4"
                />
                <span>I lost an item (Find found reports)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Found"
                  checked={status === "Found"}
                  onChange={() => setStatus("Found")}
                  className="accent-cyan-400 h-4 w-4"
                />
                <span>I found an item (Find lost reports)</span>
              </label>
            </div>

            <textarea
              placeholder={status === "Lost" 
                ? "Describe the item you lost (e.g. 'I lost a black leather wallet near the library yesterday containing ID cards')" 
                : "Describe the item you found (e.g. 'Found a grey Dell laptop in the campus cafeteria this afternoon')"}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 outline-none resize-none focus:border-cyan-400 transition"
              required
            />

            <button 
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-cyan-400 text-black py-3 rounded-xl font-bold hover:scale-105 transition"
            >
              <Search size={20}/>
              Find Matches
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-start">
          <HelpCircle className="text-cyan-400 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-lg mb-1">How does AI matching work?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our backend tokenizes your description, removes semantic noise, and measures semantic similarity (using keyword weight overlap, category matching, and key location anchors) against the opposite reported item category. Matches are computed dynamically and sorted by overall confidence.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SearchItems
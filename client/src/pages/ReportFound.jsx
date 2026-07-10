import { useState } from "react"
import { Upload, MapPin, Calendar, Package, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

function ReportFound() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Electronics")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result) // Base64 representation of image
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!title || !description || !category || !location || !date) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      await API.post("/items/found", {
        title,
        description,
        category,
        location,
        date,
        image
      })
      setSuccess(true)
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center px-6 py-10">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Report Found Item 📦
        </h1>

        <p className="text-gray-300 mb-8">
          Help someone recover their lost item by sharing details.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-xl text-center mb-5 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-xl text-center mb-5 flex items-center justify-center gap-2">
            <CheckCircle2 className="text-green-400" />
            <span>Found report submitted successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <Package size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Item name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent w-full outline-none"
              required
            />
          </div>

          <div className="bg-white/10 rounded-xl p-4 flex gap-3 items-center">
            <span className="text-gray-400 text-sm">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900 border border-white/15 text-white rounded-lg p-2 outline-none w-full"
            >
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents</option>
              <option value="Accessories">Accessories</option>
              <option value="Bags">Bags</option>
              <option value="Keys">Keys</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <textarea
              placeholder="Describe the found item (brand, color, unique markings)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent w-full outline-none h-28 resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <MapPin size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Where did you find it?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent w-full outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent w-full outline-none text-gray-300"
              required
            />
          </div>

          <div className="flex flex-col gap-2 bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Upload size={20} className="text-gray-400" />
              <span className="text-gray-300 text-sm">Upload Item Photo (optional)</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm mt-2 text-gray-400"
            />
            {image && (
              <div className="mt-3 relative w-32 h-32 border border-white/20 rounded-lg overflow-hidden">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-black py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Submitting Found Report..." : "Submit Found Report"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReportFound
import { useState } from "react"
import { User, Mail, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await API.post("/register", { name, email, password })
      navigate("/login")
    } catch (err) {
      if (err.message === "Network Error") {
        setError("Cannot connect to the backend server. Please verify that your backend server is running on port 5000.")
      } else {
        setError(err.response?.data?.message || "Registration failed. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          Create Account 🚀
        </h1>

        <p className="text-center mb-8">
          Join the AI Lost & Found community
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-xl text-center mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="flex items-center bg-white/20 rounded-xl px-4">
            <User size={20}/>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent w-full p-3 outline-none"
              required
            />
          </div>

          <div className="flex items-center bg-white/20 rounded-xl px-4">
            <Mail size={20}/>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent w-full p-3 outline-none"
              required
            />
          </div>

          <div className="flex items-center bg-white/20 rounded-xl px-4">
            <Lock size={20}/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent w-full p-3 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-6">
          Already have an account?
          <span 
            onClick={() => navigate("/login")}
            className="font-bold ml-2 cursor-pointer text-cyan-400 hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register
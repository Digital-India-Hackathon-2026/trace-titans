import { useState, useContext } from "react"
import { Mail, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import { AuthContext } from "../context/AuthContext"

function Login() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const res = await API.post("/login", { email, password })
      login(res.data.user, res.data.token)
      navigate("/dashboard")
    } catch (err) {
      if (err.message === "Network Error") {
        setError("Cannot connect to the backend server. Please verify that your backend server is running on port 5000.")
      } else {
        setError(err.response?.data?.message || "Login failed. Check your credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome Back 👋
        </h1>

        <p className="text-center mb-8">
          Login to continue finding your lost items
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-xl text-center mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-6">
          Don't have an account?
          <span 
            onClick={() => navigate("/register")}
            className="font-bold ml-2 cursor-pointer text-cyan-400 hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
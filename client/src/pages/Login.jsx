import { Mail, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"

function Login() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-950flex items-center justify-center px-6">

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md text-white">

        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome Back 👋
        </h1>

        <p className="text-center mb-8">
          Login to continue finding your lost items
        </p>


        <div className="space-y-5">

          <div className="flex items-center bg-white/20 rounded-xl px-4">
            <Mail size={20}/>
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent w-full p-3 outline-none"
            />
          </div>


          <div className="flex items-center bg-white/20 rounded-xl px-4">
            <Lock size={20}/>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent w-full p-3 outline-none"
            />
          </div>


          <button
onClick={() => {
  localStorage.setItem("isLoggedIn", "true")
  navigate("/dashboard")
}}
className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold hover:scale-105 transition"
>
 Login
</button>

        </div>


        <p className="text-center mt-6">
          Don't have an account?
          <span className="font-bold ml-2 cursor-pointer">
            Register
          </span>
        </p>

      </div>

    </div>
  )
}

export default Login
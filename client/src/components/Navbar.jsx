import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, LogIn, Home, FilePlus, PackageSearch, LogOut } from "lucide-react"
import { AuthContext } from "../context/AuthContext"

function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useContext(AuthContext)

  function handleLogout() {
    logout()
    navigate("/login")
  }


  return (

    <nav className="w-full px-8 py-5 bg-slate-950 text-white border-b border-white/10 flex justify-between items-center">


      <Link to="/" className="text-2xl font-bold">
        Trace Titans 🔍
      </Link>



      <div className="flex items-center gap-6">


        <Link to="/" className="flex items-center gap-2 hover:text-cyan-400">
          <Home size={18}/>
          Home
        </Link>


        {isLoggedIn && (

          <>

            <Link to="/dashboard">
              Dashboard
            </Link>


            <Link to="/report-lost" className="flex gap-2">
              <FilePlus size={18}/>
              Lost
            </Link>


            <Link to="/report-found" className="flex gap-2">
              <PackageSearch size={18}/>
              Found
            </Link>


            <Link to="/search" className="flex gap-2">
              <Search size={18}/>
              AI Search
            </Link>


            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 px-4 py-2 rounded-xl"
            >
              <LogOut size={18}/>
              Logout
            </button>

          </>

        )}



        {!isLoggedIn && (

          <Link 
            to="/login"
            className="flex items-center gap-2 bg-cyan-400 text-black px-4 py-2 rounded-xl font-bold"
          >
            <LogIn size={18}/>
            Login
          </Link>

        )}


      </div>


    </nav>

  )
}

export default Navbar
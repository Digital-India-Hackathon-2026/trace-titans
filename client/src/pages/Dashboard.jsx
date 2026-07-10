import { Search, FilePlus, PackageSearch } from "lucide-react"
import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">

      <h1 className="text-4xl font-bold mb-3">
        Welcome Back 👋
      </h1>

      <p className="mb-10 text-lg">
        Manage your lost and found items easily with AI assistance.
      </p>


      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">


        <div
onClick={() => navigate("/report-lost")}
className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition cursor-pointer"
>

          <FilePlus size={40} />

          <h2 className="text-2xl font-bold mt-4">
            Report Lost Item
          </h2>

          <p className="mt-2">
            Tell us about your missing item and find possible matches.
          </p>

        </div>



        <div
        onClick={() => navigate("/report-found")}
         className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition cursor-pointer">

          <PackageSearch size={40} />

          <h2 className="text-2xl font-bold mt-4">
            Report Found Item
          </h2>

          <p className="mt-2">
            Help return items by reporting what you found.
          </p>

        </div>



        <div 
        onClick={() => navigate("/search")}
        className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition cursor-pointer">

          <Search size={40} />

          <h2 className="text-2xl font-bold mt-4">
            Search Matches
          </h2>

          <p className="mt-2">
            AI finds similar lost and found items.
          </p>

        </div>


      </div>


      {/* Recent Items */}

      <div className="mt-12 bg-white/10 border border-white/10 backdrop-blur-lg rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Recent Reports
        </h2>


        <div className="space-y-3">

          <div className="bg-white/10 p-4 rounded-xl">
            🎒 College Bag - Lost
          </div>

          <div className="bg-white/10 p-4 rounded-xl">
            📱 Smartphone - Found
          </div>

          <div className="bg-white/10 p-4 rounded-xl">
            🪪 ID Card - Lost
          </div>

        </div>

      </div>


    </div>
  )
}

export default Dashboard
import { Upload, MapPin, Calendar, FileText } from "lucide-react"

function ReportLost() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center px-6">

      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">

        <h1 className="text-3xl font-bold mb-2">
          Report Lost Item 🔍
        </h1>

        <p className="text-gray-300 mb-8">
          Provide details about your lost item. Our AI will help find matches.
        </p>


        <div className="space-y-5">


          <div className="bg-white/10 rounded-xl p-4">
            <input
              type="text"
              placeholder="Item name (Phone, Wallet, Bag...)"
              className="bg-transparent w-full outline-none"
            />
          </div>



          <div className="bg-white/10 rounded-xl p-4">
            <textarea
              placeholder="Describe your item..."
              className="bg-transparent w-full outline-none h-28"
            />
          </div>



          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <MapPin size={20}/>
            <input
              type="text"
              placeholder="Where did you lose it?"
              className="bg-transparent w-full outline-none"
            />
          </div>



          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <Calendar size={20}/>
            <input
              type="date"
              className="bg-transparent w-full outline-none"
            />
          </div>



          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <Upload size={20}/>
            <input
              type="file"
            />
          </div>



          <button className="w-full bg-cyan-500 text-black py-3 rounded-xl font-bold hover:scale-105 transition">
            Submit Lost Report
          </button>


        </div>

      </div>

    </div>
  )
}

export default ReportLost
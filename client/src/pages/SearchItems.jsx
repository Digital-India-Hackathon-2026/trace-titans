import { Search, Sparkles } from "lucide-react"

function SearchItems() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-4xl mx-auto">


        <div className="text-center mb-10">

          <Sparkles 
            size={50}
            className="mx-auto text-cyan-400"
          />

          <h1 className="text-4xl font-bold mt-4">
            AI Item Matching 🤖
          </h1>

          <p className="text-gray-400 mt-3">
            Describe your lost item and let AI find possible matches.
          </p>

        </div>



        {/* Search Box */}

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">


          <textarea
            placeholder="Example: Black wallet lost near college library..."
            className="w-full h-32 bg-transparent outline-none resize-none"
          />


          <button className="mt-5 flex items-center justify-center gap-2 w-full bg-cyan-400 text-black py-3 rounded-xl font-bold hover:scale-105 transition">

            <Search size={20}/>

            Find Matches

          </button>


        </div>



        {/* AI Result */}

        <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">


          <h2 className="text-2xl font-bold mb-5">
            AI Match Results
          </h2>


          <div className="bg-white/10 rounded-xl p-5">


            <h3 className="text-xl font-bold">
              📱 Black Smartphone
            </h3>


            <p className="text-gray-300 mt-2">
              Found near Railway Station Platform 2
            </p>


            <div className="mt-4">

              <p>
                Match Confidence:
              </p>


              <div className="w-full bg-gray-700 rounded-full h-3 mt-2">

                <div 
                  className="bg-cyan-400 h-3 rounded-full w-[92%]"
                >
                </div>

              </div>


              <p className="text-cyan-400 mt-2 font-bold">
                92% Match
              </p>

            </div>


          </div>


        </div>


      </div>


    </div>
  )
}

export default SearchItems
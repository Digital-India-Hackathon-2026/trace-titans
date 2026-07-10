function Matches() {

  const matches = [
    {
      name: "Black Smartphone",
      location: "College Library",
      score: 94
    },
    {
      name: "Leather Wallet",
      location: "Cafeteria",
      score: 87
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white px-8 py-10">

      <h1 className="text-4xl font-bold mb-3">
        🤖 AI Match Results
      </h1>

      <p className="text-lg mb-10">
        AI analyzed lost and found reports to find possible matches.
      </p>


      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Possible Matches Found
        </h2>


        <div className="space-y-5">

          {matches.map((item, index) => (

            <div
              key={index}
              className="bg-white/10 rounded-xl p-5"
            >

              <h3 className="text-xl font-bold">
                📦 {item.name}
              </h3>

              <p className="mt-2">
                📍 Location: {item.location}
              </p>

              <p className="mt-2">
                ⭐ AI Match Score:
                <span className="font-bold">
                  {" "}{item.score}%
                </span>
              </p>


              <button className="mt-4 bg-white text-black px-5 py-2 rounded-lg hover:scale-105 transition">
                Contact Finder
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}

export default Matches
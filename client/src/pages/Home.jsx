
function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-bold mb-6">
          AI Powered Lost & Found Portal
        </h1>

        <p className="text-lg max-w-2xl mb-8">
          Lost something important? Found an item?
          Our AI-powered platform helps connect lost items with their owners
          quickly and securely.
        </p>

        <div className="flex gap-5">
          <button className="bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
            Report Lost Item
          </button>

          <button className="bg-black/30 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
            Report Found Item
          </button>
        </div>
      </section>


      <section className="grid md:grid-cols-3 gap-6 px-10 pb-20">

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-3">
            🤖 AI Matching
          </h2>
          <p>
            AI compares descriptions and images to find possible matches.
          </p>
        </div>


        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-3">
            📍 Location Tracking
          </h2>
          <p>
            Find where items were lost or discovered.
          </p>
        </div>


        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-3">
            🔒 Secure Recovery
          </h2>
          <p>
            Connect owners and finders safely.
          </p>
        </div>

      </section>

    </div>
  )
}

export default Home
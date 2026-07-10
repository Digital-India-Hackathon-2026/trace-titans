function RewardCard() {
  const points = 150;
  const itemsReturned = 3;

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">

      <h2 className="text-2xl font-bold">
        🏆 Good Samaritan Rewards
      </h2>

      <div className="mt-5 grid md:grid-cols-2 gap-5">

        <div className="bg-white/10 rounded-xl p-5">
          <p className="text-gray-300">
            Total Points
          </p>

          <h3 className="text-4xl font-bold mt-2">
            ⭐ {points}
          </h3>
        </div>


        <div className="bg-white/10 rounded-xl p-5">
          <p className="text-gray-300">
            Items Helped Return
          </p>

          <h3 className="text-4xl font-bold mt-2">
            {itemsReturned} 🎁
          </h3>
        </div>

      </div>


      <p className="mt-5 text-gray-300">
        Keep helping the community and earn more Good Samaritan points!
      </p>


      <div className="mt-5 bg-white/10 rounded-xl p-4">
        <p className="font-semibold">
          Next Achievement 🏅
        </p>

        <p className="text-sm text-gray-300 mt-1">
          Earn 50 more points to become a Community Hero.
        </p>
      </div>


    </div>
  )
}

export default RewardCard
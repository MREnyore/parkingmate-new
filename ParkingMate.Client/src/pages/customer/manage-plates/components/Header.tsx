export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* PARKING-MATE Logo */}
        <div className="bg-black text-white px-3 py-2 rounded text-sm font-bold">
          PARKING
          <br />
          -MATE
        </div>

        {/* Life Gym Logo */}
        <div className="flex items-center space-x-1">
          <span className="text-lg font-bold">Life</span>
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="text-lg font-bold">Gym</span>
        </div>
      </div>
    </header>
  )
}

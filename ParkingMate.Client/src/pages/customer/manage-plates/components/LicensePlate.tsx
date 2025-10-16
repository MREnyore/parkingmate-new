import { CircleDashed } from 'lucide-react'
import { motion } from 'motion/react'

interface LicensePlateProps {
  plateNumber: string
}

export const LicensePlate = ({ plateNumber }: LicensePlateProps) => {
  return (
    <motion.div className="relative min-w-fit">
      {/* Plate Background */}
      <div className="bg-white border-black rounded-sm p-3 border-2 relative overflow-hidden">
        {/* EU Flag Section */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#275BC0] flex flex-col items-center justify-center">
          <CircleDashed className="text-yellow-500 size-4" />
        </div>

        {/* Plate Content - Display as-is without formatting */}
        <div className="ml-10 flex items-center justify-center">
          <span className="text-black font-bold text-lg tracking-wider">
            {plateNumber}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

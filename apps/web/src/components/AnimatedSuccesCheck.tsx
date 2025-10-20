import { motion } from 'motion/react'

export const AnimatedSuccesCheck = () => {
  return (
    <motion.div
      className="relative mx-auto w-24 h-24 mb-8"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        delay: 0.2,
        duration: 0.6,
        type: 'spring',
        bounce: 0.4
      }}
    >
      {/* Outer ring with gradient */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />

      {/* Inner circle */}
      <motion.div
        className="absolute inset-2 rounded-full bg-white shadow-inner flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {/* Checkmark */}
        <motion.svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      {/* Pulsing ring effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-green-400"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          delay: 0.8,
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  )
}

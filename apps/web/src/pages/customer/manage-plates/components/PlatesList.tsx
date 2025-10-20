import { motion } from 'motion/react'
import type { Car } from '@/types/api'
import { PlateCard } from './PlateCard'

interface PlatesListProps {
  cars: Car[]
  onEdit: (plate: Car) => void
  onDelete: (car: Car) => void
}

export const PlatesList = ({ cars, onEdit, onDelete }: PlatesListProps) => {
  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
    >
      {cars?.map((car, index) => (
        <PlateCard
          key={car.id}
          car={car}
          index={index}
          canDelete={cars.length > 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  )
}

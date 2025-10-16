import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface AddPlateButtonProps {
  onAddPlate: () => void
}

export const AddPlateButton = ({ onAddPlate }: AddPlateButtonProps) => {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Button onClick={onAddPlate} className="w-full" size="sm">
        <Plus className="mr-2 size-4 text-white" />
        {t('add_plate', { defaultValue: 'Kennzeichen hinzufügen' })}
      </Button>
    </motion.div>
  )
}

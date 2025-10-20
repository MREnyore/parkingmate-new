import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface AddPlateButtonProps {
  onAddPlate: () => void
}

export const AddPlateButton = ({ onAddPlate }: AddPlateButtonProps) => {
  const { t } = useTranslation()

  return (
    <Button onClick={onAddPlate} className="w-fit" size="sm">
      <Plus className="mr-2 size-4 text-white" />
      {t('add_plate', { defaultValue: 'Kennzeichen hinzufügen' })}
    </Button>
  )
}

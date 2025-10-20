import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import { licensePlateSchema, shortNameSchema } from '@/lib/validations'
import { useAddCarInfo, useUpdateCarInfo } from '@/mutations/customer'
import type { Car } from '@/types/api'
import { LicensePlate } from './LicensePlate'

// Zod schema for car info validation using reusable schemas
const carInfoSchema = z.object({
  licensePlate: licensePlateSchema,
  label: shortNameSchema,
  brand: shortNameSchema,
  model: shortNameSchema
})

type CarInfoFormData = z.infer<typeof carInfoSchema>

interface EditPlateInfoProps {
  isOpen: boolean
  carData?: Car
  isEditing: boolean
  onCancel: () => void
}

export const EditPlateInfo = ({
  isOpen,
  carData,
  isEditing,
  onCancel
}: EditPlateInfoProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  // Car mutations
  const { mutateAsync: addCarInfo, isPending: isAddingCar } = useAddCarInfo()
  const { mutateAsync: updateCarInfo, isPending: isUpdatingCar } =
    useUpdateCarInfo()

  const isLoading = isAddingCar || isUpdatingCar

  // React Hook Form with Zod validation
  const form = useForm<CarInfoFormData>({
    resolver: zodResolver(carInfoSchema),
    mode: 'onChange',
    defaultValues: {
      licensePlate: carData?.licensePlate,
      label: carData?.label,
      brand: carData?.brand,
      model: carData?.model
    }
  })

  const onSubmit = async (data: CarInfoFormData) => {
    if (carData?.id) {
      // Update existing car
      await updateCarInfo({
        carId: carData.id,
        carInfo: data
      })
    } else {
      // Add new car
      await addCarInfo(data)
    }
    onCancel() // Close the dialog on success
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (carData) {
        // Edit mode - populate with car data
        form.reset({
          licensePlate: carData.licensePlate,
          label: carData.label,
          brand: carData.brand,
          model: carData.model
        })
      } else {
        // Add mode - reset to empty form
        form.reset({
          licensePlate: '',
          label: '',
          brand: '',
          model: ''
        })
      }
    }
  }, [isOpen, carData, form])

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading && !form.formState.isDirty) {
          onCancel()
        }
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        // if mobile, set width to 100%
        className={cn(
          'w-[400px] sm:w-[540px] p-6 overflow-y-auto',
          isMobile && 'w-full',
          isMobile && 'max-h-[calc(100dvh-1rem)]'
        )}
        onEscapeKeyDown={
          isLoading || form.formState.isDirty ? undefined : onCancel
        }
        onPointerDownOutside={
          isLoading || form.formState.isDirty ? undefined : onCancel
        }
      >
        <SheetHeader className="p-0 pt-6">
          <SheetTitle>
            {isEditing
              ? t('edit_plate_info', {
                  defaultValue: 'Kennzeichen bearbeiten'
                })
              : t('add_plate_info', {
                  defaultValue: 'Kennzeichen hinzufügen'
                })}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? t('edit_plate_description', {
                  defaultValue:
                    'Bearbeiten Sie die Informationen zu Ihrem Kennzeichen.'
                })
              : t('add_plate_description', {
                  defaultValue:
                    'Fügen Sie ein neues Kennzeichen zu Ihrem Konto hinzu.'
                })}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* German License Plate Preview */}
            <div className="text-center pt-4">
              <LicensePlate
                plateNumber={form.watch('licensePlate') ?? 'M-AB 1234'}
              />
            </div>

            {/* Plate Number Input */}
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('plate_number', { defaultValue: 'Kennzeichen' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="M-AB 1234"
                      className="text-center font-mono text-lg"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto Information Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {t('auto_information', { defaultValue: 'Auto Information' })}
                </h3>
              </div>

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('auto_name', { defaultValue: 'Auto Name' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auto_name_placeholder', {
                          defaultValue: 'z.B. Mamas Auto'
                        })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('auto_brand', { defaultValue: 'Automarke' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auto_brand_placeholder', {
                          defaultValue: 'z.B. BMW, Audi'
                        })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('auto_model', { defaultValue: 'Automodell' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auto_model_placeholder', {
                          defaultValue: 'z.B. A3, Golf'
                        })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="mr-2 size-4" />
                {t('cancel', { defaultValue: 'Abbrechen' })}
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.formState.isValid ||
                  !form.formState.isDirty ||
                  isLoading
                }
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus size={16} className="mr-2" />
                )}
                {isLoading
                  ? isEditing
                    ? t('updating', { defaultValue: 'Aktualisieren...' })
                    : t('adding', { defaultValue: 'Hinzufügen...' })
                  : isEditing
                    ? t('save_changes', {
                        defaultValue: 'Änderungen speichern'
                      })
                    : t('add_plate_action', {
                        defaultValue: 'KENNZEICHEN HINZUFÜGEN'
                      })}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

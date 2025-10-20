import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { ParkingSpot } from '../types'

// Zod schema for parking spot validation
const parkingSpotSchema = z.object({
  name: z.string().min(1, 'Name des Parkplatzes ist erforderlich'),
  address: z.string().min(1, 'Adresse ist erforderlich'),
  capacity: z
    .string()
    .min(1, 'Kapazität ist erforderlich')
    .regex(/^\d+$/, 'Kapazität darf nur Zahlen enthalten')
    .refine((val) => parseInt(val, 10) > 0, {
      message: 'Kapazität muss größer als 0 sein'
    })
})

type ParkingSpotFormData = z.infer<typeof parkingSpotSchema>

interface EditParkingSpotProps {
  isOpen: boolean
  parkingSpot?: ParkingSpot // undefined for "add" action
  onCancel: () => void
  onSave: (data: ParkingSpotFormData) => Promise<void>
}

export const EditParkingSpot = ({
  isOpen,
  parkingSpot,
  onCancel,
  onSave
}: EditParkingSpotProps) => {
  const isMobile = useIsMobile()
  const isAddMode = !parkingSpot

  // React Hook Form with Zod validation
  const form = useForm<ParkingSpotFormData>({
    resolver: zodResolver(parkingSpotSchema),
    mode: 'onChange',
    defaultValues: {
      name: parkingSpot?.name ?? '',
      address: parkingSpot?.address ?? '',
      capacity: parkingSpot?.capacity ? String(parkingSpot.capacity) : ''
    }
  })

  const onSubmit = async (data: ParkingSpotFormData) => {
    try {
      await onSave(data)
      form.reset()
      onCancel()
    } catch (error) {
      console.error('Failed to save parking spot:', error)
    }
  }

  // Reset form when parkingSpot changes (when sheet opens)
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: parkingSpot?.name ?? '',
        address: parkingSpot?.address ?? '',
        capacity: `${parkingSpot?.capacity ?? ''}`
      })
    }
  }, [parkingSpot, isOpen, form])

  const isSubmitting = form.formState.isSubmitting

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting && !form.formState.isDirty) {
          onCancel()
        }
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'w-[400px] sm:w-[540px] p-6 overflow-y-auto',
          isMobile && 'w-full',
          isMobile && 'max-h-[calc(100dvh-1rem)]'
        )}
        onEscapeKeyDown={
          isSubmitting || form.formState.isDirty ? undefined : onCancel
        }
        onPointerDownOutside={
          isSubmitting || form.formState.isDirty ? undefined : onCancel
        }
      >
        <SheetHeader className="p-0 pt-6">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded">
              P
            </span>
            {isAddMode ? 'NEUEN PARKPLATZ ERSTELLEN' : 'Parkplatz bearbeiten'}
          </SheetTitle>
          <SheetDescription>
            {isAddMode
              ? 'Erstellen Sie einen neuen Parkplatz mit den grundlegenden Informationen.'
              : 'Bearbeiten Sie die Parkplatzinformationen.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Name des Parkplatzes*
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='z.B., "Studio Nord"' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Adresse*
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='z.B., "Studio Nord"' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity Field */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Kapazität (Anzahl Plätze)*
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder='z.B., "30"'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 size-4" />
                ZURÜCK
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                {isSubmitting
                  ? 'Speichern...'
                  : isAddMode
                    ? 'PARKPLATZ ERSTELLEN'
                    : 'ÄNDERUNGEN SPEICHERN'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Edit, Loader2, Save, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import type { ParkingSpot } from '../../types'

// Zod schema for editing parking spot (all fields including rules)
const editParkingSpotSchema = z.object({
  name: z.string().min(1, 'Name des Parkplatzes ist erforderlich'),
  address: z.string().min(1, 'Adresse ist erforderlich'),
  capacity: z
    .string()
    .min(1, 'Kapazität ist erforderlich')
    .regex(/^\d+$/, 'Kapazität darf nur Zahlen enthalten')
    .refine((val) => parseInt(val, 10) > 0, {
      message: 'Kapazität muss größer als 0 sein'
    }),
  // Rule management fields
  maxParkingDuration: z.object({
    enabled: z.boolean(),
    value: z.string().optional(),
    unit: z.enum(['minutes', 'hours']).optional()
  }),
  validTimes: z.object({
    enabled: z.boolean(),
    days: z.string().optional(), // e.g., "Mo - Fr"
    timeRange: z.string().optional() // e.g., "[08:00] bis [18:00]"
  }),
  accessControl: z.object({
    enabled: z.boolean(),
    type: z.enum(['registered', 'registered_and_guests']).optional()
  }),
  maxVehiclesPerUser: z.object({
    enabled: z.boolean(),
    value: z.string().optional()
  }),
  penaltyFee: z.object({
    enabled: z.boolean(),
    value: z.string().optional()
  })
})

type EditParkingFormData = z.infer<typeof editParkingSpotSchema>

interface EditParkingProps {
  isOpen: boolean
  parkingSpot: ParkingSpot
  onCancel: () => void
  onSave: (data: EditParkingFormData) => Promise<void>
  readOnly?: boolean
  onEnableEdit?: () => void
}

export const EditParking = ({
  isOpen,
  parkingSpot,
  onCancel,
  onSave,
  readOnly = false,
  onEnableEdit
}: EditParkingProps) => {
  const isMobile = useIsMobile()

  // React Hook Form with Zod validation
  const form = useForm<EditParkingFormData>({
    resolver: zodResolver(editParkingSpotSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: EditParkingFormData) => {
    try {
      await onSave(data)
      onCancel()
    } catch (error) {
      console.error('Failed to update parking spot:', error)
    }
  }

  const isSubmitting = form.formState.isSubmitting

  // Watch toggle states
  const maxParkingEnabled = form.watch('maxParkingDuration.enabled')
  const validTimesEnabled = form.watch('validTimes.enabled')
  const accessControlEnabled = form.watch('accessControl.enabled')
  const maxVehiclesEnabled = form.watch('maxVehiclesPerUser.enabled')
  const penaltyFeeEnabled = form.watch('penaltyFee.enabled')

  useEffect(() => {
    if (parkingSpot) {
      const ruleConfig =
        'ruleConfig' in parkingSpot
          ? parkingSpot.ruleConfig
          : {
              maxParkingDuration: {
                enabled: false,
                value: '90',
                unit: 'minutes' as const
              },
              validTimes: {
                enabled: false,
                days: 'Mo - Fr',
                timeRange: '[08:00] bis [18:00]'
              },
              accessControl: { enabled: false, type: 'registered' as const },
              maxVehiclesPerUser: { enabled: false, value: '1' },
              penaltyFee: { enabled: false, value: '40' }
            }

      form.reset({
        name: parkingSpot?.name,
        address: parkingSpot?.address,
        capacity: String(parkingSpot?.capacity),
        maxParkingDuration: ruleConfig?.maxParkingDuration,
        validTimes: ruleConfig?.validTimes,
        accessControl: ruleConfig?.accessControl,
        maxVehiclesPerUser: ruleConfig?.maxVehiclesPerUser,
        penaltyFee: ruleConfig?.penaltyFee
      })
    }
  }, [parkingSpot, form])

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel()
        }
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'w-[400px] sm:w-[540px] p-0 flex flex-col gap-0',
          isMobile && 'w-full',
          isMobile && 'max-h-[calc(100dvh-1rem)]'
        )}
      >
        {/* Fixed Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded">
                  P
                </span>
                {readOnly ? 'PARKPLATZDETAILS' : 'PARKPLATZREGELVERWALTUNG'}
              </SheetTitle>
              <SheetDescription className="mt-2">
                {readOnly
                  ? 'Ansicht der Parkplatzinformationen und Regelkonfiguration.'
                  : 'Bearbeiten Sie die Parkplatzinformationen und Regelkonfiguration.'}
              </SheetDescription>
            </div>
            {readOnly && onEnableEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEnableEdit}
                className="mt-auto"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name des Parkplatzes*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='z.B., "Studio Nord"'
                          {...field}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='z.B., "Hauptstraße 12"'
                          {...field}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapazität (Anzahl Plätze)*</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder='z.B., "30"'
                          {...field}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Max Parking Duration */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      MAXIMALE PARKDAUER
                    </Label>
                    <FormDescription>
                      Begrenzt die maximale Dauer, die ein Fahrzeug auf dem
                      Parkplatz stehen darf
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="maxParkingDuration.enabled"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                    )}
                  />
                </div>

                <div
                  className={cn(
                    maxParkingEnabled ? 'opacity-100' : 'opacity-30',
                    'transition-opacity duration-200 mt-4'
                  )}
                >
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="maxParkingDuration.unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Einheit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                disabled={readOnly || !maxParkingEnabled}
                              >
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="minutes">Minuten</SelectItem>
                              <SelectItem value="hours">Stunden</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxParkingDuration.value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dauer</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="z.B., 90"
                              {...field}
                              disabled={readOnly || !maxParkingEnabled}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Valid Times */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      GÜLTIGE ZEITEN (AKTIVE ZEITEN)
                    </Label>
                    <FormDescription>
                      Definiert, an welchen Tagen und zu welchen Uhrzeiten die
                      Regel aktiv ist.
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="validTimes.enabled"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                    )}
                  />
                </div>

                <div
                  className={cn(
                    validTimesEnabled ? 'opacity-100' : 'opacity-30',
                    'transition-opacity duration-200 mt-4'
                  )}
                >
                  <div className="space-y-6">
                    <div>
                      <Label>Tage</Label>
                      <Select
                        defaultValue="mo-fr"
                        disabled={readOnly || !validTimesEnabled}
                      >
                        <SelectTrigger className="h-10 mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mo-fr">Mo - Fr</SelectItem>
                          <SelectItem value="mo-so">Mo - So</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Uhrzeit</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="relative">
                          <Input
                            type="time"
                            defaultValue="08:00"
                            disabled={readOnly || !validTimesEnabled}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none pr-10"
                          />
                          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                        <div className="relative">
                          <Input
                            type="time"
                            defaultValue="18:00"
                            disabled={readOnly || !validTimesEnabled}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none pr-10"
                          />
                          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      ZUGRIFFSVERWALTUNG
                    </Label>
                    <FormDescription>Wer darf parken?</FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="accessControl.enabled"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                    )}
                  />
                </div>

                <div
                  className={cn(
                    accessControlEnabled ? 'opacity-100' : 'opacity-30',
                    'transition-opacity duration-200'
                  )}
                >
                  <FormField
                    control={form.control}
                    name="accessControl.type"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            disabled={readOnly || !accessControlEnabled}
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="registered" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Nur registrierte Nutzer
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="registered_and_guests" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Nutzer und registrierte Gäste
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Max Vehicles Per User */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      MAXIMALE FAHRZEUGE PRO NUTZER
                    </Label>
                    <FormDescription>Maximale Anzahl</FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="maxVehiclesPerUser.enabled"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                    )}
                  />
                </div>

                <div
                  className={cn(
                    maxVehiclesEnabled ? 'opacity-100' : 'opacity-30',
                    'transition-opacity duration-200 mt-4'
                  )}
                >
                  <FormField
                    control={form.control}
                    name="maxVehiclesPerUser.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="1"
                            {...field}
                            disabled={readOnly || !maxVehiclesEnabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Penalty Fee */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      VERTRAGSSTRAFE
                    </Label>
                    <FormDescription>
                      Vertragsstrafe bei Verstoß
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="penaltyFee.enabled"
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                    )}
                  />
                </div>

                <div
                  className={cn(
                    penaltyFeeEnabled ? 'opacity-100' : 'opacity-30',
                    'transition-opacity duration-200 mt-4'
                  )}
                >
                  <FormField
                    control={form.control}
                    name="penaltyFee.value"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="40"
                              {...field}
                              className="pr-8"
                              disabled={readOnly || !penaltyFeeEnabled}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                              €
                            </span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t shrink-0 bg-background">
              {readOnly ? (
                <Button type="button" onClick={onCancel} className="w-full">
                  <X className="mr-2 size-4" />
                  SCHLIEẞEN
                </Button>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 size-4" />
                    ABBRECHEN
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !form.formState.isDirty ||
                      !form.formState.isValid ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    {isSubmitting ? 'Speichern...' : 'ÄNDERUNGEN SPEICHERN'}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

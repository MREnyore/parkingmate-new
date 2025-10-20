import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Edit,
  Loader2,
  Plus,
  Save,
  Trash2,
  X
} from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'
import {
  emailSchema,
  licensePlateSchema,
  nameSchema,
  optionalAddressSchema,
  optionalCitySchema,
  optionalPhoneSchema,
  optionalPostalCodeSchema,
  shortNameSchema
} from '@/lib/validations'
import { useCreateCustomer, useUpdateCustomer } from '@/mutations/admin'
import type { CustomerWithCars } from '@/types/api'

// Zod schema for editing customer (all fields) using reusable validation schemas
const editCustomerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phoneNumber: optionalPhoneSchema,
  address: optionalAddressSchema,
  postalCode: optionalPostalCodeSchema,
  city: optionalCitySchema,
  isPermanentParker: z.boolean(),
  parkingStartDate: z.date().optional(),
  parkingEndDate: z.date().optional(),
  cars: z.array(
    z.object({
      id: z.string().optional(),
      licensePlate: licensePlateSchema,
      brand: shortNameSchema,
      model: shortNameSchema,
      label: shortNameSchema
    })
  )
})

export type CustomerFormData = z.infer<typeof editCustomerSchema>

interface CustomerSheetContentProps {
  isOpen: boolean
  customer?: CustomerWithCars // undefined for "add" mode
  onCancel: () => void
  readOnly?: boolean
  onEnableEdit?: () => void
}

export const CustomerSheet = ({
  isOpen,
  customer,
  onCancel,
  readOnly = false,
  onEnableEdit
}: CustomerSheetContentProps) => {
  const isAddMode = !customer
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  // React Hook Form with Zod validation
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
    mode: 'onChange'
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'cars'
  })

  console.log(form.watch())

  // Mutations
  const createCustomerMutation = useCreateCustomer(() => {
    onCancel()
  })

  const updateCustomerMutation = useUpdateCustomer(() => {
    onCancel()
  })

  const isSubmitting =
    createCustomerMutation.isPending || updateCustomerMutation.isPending

  const onSubmit = async (data: CustomerFormData) => {
    const payload = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber ?? '',
      address: data.address ?? '',
      postalCode: data.postalCode ?? '',
      city: data.city ?? '',
      isPermanentParker: data.isPermanentParker,
      parkingStartDate: data.parkingStartDate
        ? data.parkingStartDate.toISOString()
        : undefined,
      parkingEndDate: data.parkingEndDate
        ? data.parkingEndDate.toISOString()
        : undefined,
      cars: data.cars.map((car) => ({
        id: car.id,
        licensePlate: car.licensePlate,
        brand: car.brand ?? '',
        model: car.model ?? '',
        label: car.label ?? ''
      }))
    }

    if (isAddMode) {
      await createCustomerMutation.mutateAsync(payload)
    } else {
      await updateCustomerMutation.mutateAsync({
        customerId: customer.id,
        payload
      })
    }
  }

  const handleAddCar = () => {
    append({
      licensePlate: '',
      brand: '',
      model: '',
      label: ''
    })
  }

  useEffect(() => {
    if (!isOpen) return

    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber ?? '',
        address: customer.address ?? '',
        postalCode: customer.postalCode ?? '',
        city: customer.city ?? '',
        isPermanentParker: !customer.membershipExpiryDate,
        parkingStartDate: undefined,
        parkingEndDate: customer.membershipExpiryDate
          ? new Date(customer.membershipExpiryDate)
          : undefined,
        cars: customer.cars.map((car) => ({
          id: car.id,
          licensePlate: car.licensePlate,
          brand: car.brand ?? '',
          model: car.model ?? '',
          label: car.label ?? ''
        }))
      })
    } else {
      // Reset to empty form for add mode
      form.reset({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        postalCode: '',
        city: '',
        isPermanentParker: false,
        parkingStartDate: undefined,
        parkingEndDate: undefined,
        cars: []
      })
    }
  }, [customer, isOpen, form])

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
          'w-[400px] sm:w-[740px] sm:max-w-[740px] p-0 flex flex-col gap-0',
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
                  C
                </span>
                {readOnly
                  ? 'KUNDENDETAILS'
                  : isAddMode
                    ? t('create_customer')
                    : t('edit_customer')}
              </SheetTitle>
              <SheetDescription className="mt-2">
                {readOnly
                  ? 'Ansicht der Kundeninformationen und Fahrzeuge.'
                  : isAddMode
                    ? 'Fügen Sie einen neuen Kunden zu Ihrer Organisation hinzu.'
                    : 'Bearbeiten Sie die Kundeninformationen und Fahrzeuge.'}
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
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('customer_name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="z.B., Max Mustermann"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="max@beispiel.de"
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone_number')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+49 123 456789"
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
                      <FormLabel>{t('address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Hauptstraße 12"
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
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('postal_code')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345"
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('city')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Berlin"
                          {...field}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Parking Authorization */}
              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {t('parkberechtigung').toUpperCase()}
                    </Label>
                    <FormDescription>
                      Permanent parkers have unlimited parking access
                    </FormDescription>
                  </div>
                  <FormField
                    control={form.control}
                    name="isPermanentParker"
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
                    !form.watch('isPermanentParker')
                      ? 'opacity-100'
                      : 'opacity-30',
                    'transition-opacity duration-200 grid gap-4 grid-cols-2'
                  )}
                >
                  <FormField
                    control={form.control}
                    name="parkingStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('parking_start_date')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild={true}>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value &&
                                    'text-muted-foreground transition-opacity duration-200'
                                )}
                                disabled={
                                  readOnly || form.watch('isPermanentParker')
                                }
                              >
                                {field.value ? (
                                  format(new Date(field.value), 'dd.MM.yyyy')
                                ) : (
                                  <span>Select Date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => field.onChange(date)}
                              disabled={
                                readOnly || form.watch('isPermanentParker')
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parkingEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('parking_end_date')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild={true}>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={
                                  readOnly || form.watch('isPermanentParker')
                                }
                              >
                                {field.value ? (
                                  format(field.value, 'dd.MM.yyyy')
                                ) : (
                                  <span>Select Date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date) => {
                                if (
                                  readOnly ||
                                  form.watch('isPermanentParker')
                                ) {
                                  return true
                                }
                                const startDate = form.watch('parkingStartDate')
                                if (startDate && date < startDate) {
                                  return true
                                }
                                return false
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cars */}
              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">{t('cars')}</h3>
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCar}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('add_car')}
                    </Button>
                  )}
                </div>

                {fields.length === 0 && (
                  <div className="text-center">
                    <p>Keine Fahrzeuge</p>
                  </div>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 rounded-md border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {t('cars')} {index + 1}
                      </h4>
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`cars.${index}.licensePlate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('license_plate')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="B-AB 1234"
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
                        name={`cars.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('label')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mein Auto"
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
                        name={`cars.${index}.brand`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('brand')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="BMW"
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
                        name={`cars.${index}.model`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('model')}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="3 Series"
                                {...field}
                                disabled={readOnly}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
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
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    {isSubmitting
                      ? 'Speichern...'
                      : isAddMode
                        ? t('create_customer')
                        : t('save_changes')}
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

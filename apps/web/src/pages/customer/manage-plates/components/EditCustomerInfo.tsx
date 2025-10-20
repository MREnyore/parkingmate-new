import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'
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
import {
  emailSchema,
  nameSchema,
  optionalAddressSchema,
  optionalCitySchema,
  optionalPhoneSchema,
  optionalPostalCodeSchema
} from '@/lib/validations'
import { useUpdateCustomerInfo } from '@/mutations/customer'
import type { Customer } from '@/types/api'

// Zod schema for customer info validation using reusable schemas
const customerInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phoneNumber: optionalPhoneSchema,
  address: optionalAddressSchema,
  postalCode: optionalPostalCodeSchema,
  city: optionalCitySchema
})

type CustomerInfoFormData = z.infer<typeof customerInfoSchema>

interface EditCustomerInfoProps {
  isOpen: boolean
  customerPersonalInfo: Customer
  onCancel: () => void
}

export const EditCustomerInfo = ({
  isOpen,
  customerPersonalInfo,
  onCancel
}: EditCustomerInfoProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  // Update mutation
  const { mutateAsync: updateCustomerInfo, isPending: isUpdatingCustomerInfo } =
    useUpdateCustomerInfo(() => {
      onCancel()
    })

  // React Hook Form with Zod validation
  const form = useForm<CustomerInfoFormData>({
    resolver: zodResolver(customerInfoSchema),
    mode: 'onChange',
    defaultValues: {
      name: customerPersonalInfo.name,
      email: customerPersonalInfo.email,
      phoneNumber: customerPersonalInfo?.phoneNumber,
      address: customerPersonalInfo?.address,
      postalCode: customerPersonalInfo?.postalCode,
      city: customerPersonalInfo?.city
    }
  })

  const onSubmit = async (data: CustomerInfoFormData) => {
    await updateCustomerInfo(data)
  }

  // Reset form when customerPersonalInfo changes (when dialog opens)
  useEffect(() => {
    form.reset({
      name: customerPersonalInfo.name,
      email: customerPersonalInfo.email,
      phoneNumber: customerPersonalInfo?.phoneNumber,
      address: customerPersonalInfo?.address,
      postalCode: customerPersonalInfo?.postalCode,
      city: customerPersonalInfo?.city
    })
  }, [customerPersonalInfo, form])

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isUpdatingCustomerInfo && !form.formState.isDirty) {
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
          isUpdatingCustomerInfo || form.formState.isDirty
            ? undefined
            : onCancel
        }
        onPointerDownOutside={
          isUpdatingCustomerInfo || form.formState.isDirty
            ? undefined
            : onCancel
        }
      >
        <SheetHeader className="p-0 pt-6">
          <SheetTitle>
            {t('edit_personal_info', {
              defaultValue: 'Persönliche Angaben bearbeiten'
            })}
          </SheetTitle>
          <SheetDescription>
            {t('edit_personal_info_description', {
              defaultValue:
                'Bearbeiten Sie Ihre persönlichen Informationen hier.'
            })}
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
                    {t('name', { defaultValue: 'Name' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('name_placeholder', {
                        defaultValue: 'Vor- und Nachname'
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              disabled={true}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('email', { defaultValue: 'E-Mail' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      type="email"
                      placeholder={t('email_placeholder', {
                        defaultValue: 'ihre.email@beispiel.de'
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t('phone', { defaultValue: 'Telefon' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder={t('phone_placeholder', {
                        defaultValue: '+49 123 456789'
                      })}
                      {...field}
                    />
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
                    {t('address', { defaultValue: 'Adresse' })}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('address_placeholder', {
                        defaultValue: 'Straße und Hausnummer'
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Postal Code and City Row */}
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('postal_code', { defaultValue: 'PLZ' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('postal_code_placeholder', {
                          defaultValue: '12345'
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('city', { defaultValue: 'Stadt' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('city_placeholder', {
                          defaultValue: 'Stadt'
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
                disabled={isUpdatingCustomerInfo}
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
                  isUpdatingCustomerInfo
                }
                className="flex-1"
              >
                {isUpdatingCustomerInfo ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                {isUpdatingCustomerInfo
                  ? t('saving', { defaultValue: 'Speichern...' })
                  : t('save', { defaultValue: 'Speichern' })}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

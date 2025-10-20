import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/hooks/useTranslation'
import { nameSchema, passwordChangeSchema } from '@/lib/validations'
import { useChangeUserPassword, useUpdateUserProfile } from '@/mutations/admin'
import { useAdminLogout } from '@/mutations/auth'
import { useAdminUserInfo } from '@/queries/admin'

// Zod schema for profile validation using reusable schemas
const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordChangeSchema>

export function AccountPage() {
  const { t } = useTranslation()

  // Fetch user data
  const { data: userInfo, isLoading, isError } = useAdminUserInfo()

  // Admin logout mutation
  const { mutateAsync: handleAdminLogout } = useAdminLogout()

  // Profile form with Zod validation
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: {
      firstName: '',
      lastName: ''
    }
  })

  // Password form with reusable schemas
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onChange', // Validate on every change
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Mutations with onSuccess callbacks
  const updateProfileMutation = useUpdateUserProfile(() => {
    // Reset form to mark as pristine after successful save
    const currentValues = profileForm.getValues()
    profileForm.reset(currentValues)
  })

  const changePasswordMutation = useChangeUserPassword(() => {
    // Clear password fields on success
    passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // Show success toast and logout after 2 seconds
    toast.success('Password Changed Successfully', {
      description: 'You will be logged out in 2 seconds for security reasons.'
    })

    setTimeout(async () => {
      // Perform proper admin logout (clears session on server + client)
      await handleAdminLogout()
    }, 2000)
  })

  const onSubmitProfile = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim()
    })
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    })
  }

  // Initialize forms with user data
  useEffect(() => {
    if (userInfo && userInfo.success && userInfo.user) {
      profileForm.reset({
        firstName: userInfo.user.firstName,
        lastName: userInfo.user.lastName
      })
    }
  }, [userInfo, profileForm])

  return (
    <DashboardLayout isContentLoading={isLoading} isContentError={isError}>
      <Card className="p-6 rounded-sm">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="border-b pb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {t('account')}
            </h1>
            <p className="text-muted-foreground">{t('account_description')}</p>
          </div>

          {/* Profile Picture Section - Commented out for MVP */}
          {/* <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={
                      userInfo?.profilePictureUrl ?? '/api/placeholder/96/96'
                    }
                    alt="Profile"
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {profileForm.watch('firstName') &&
                    profileForm.watch('lastName')
                      ? `${profileForm.watch('firstName').charAt(0)}${profileForm.watch('lastName').charAt(0)}`.toUpperCase()
                      : (userInfo?.email?.charAt(0)?.toUpperCase() ?? 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {t('profile_picture')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('png_jpeg_under_15mb')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUploadPhoto}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {t('upload_new_image')}
                    </Button>
                    <Button variant="outline" onClick={handleDeletePhoto}>
                      {t('delete')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator /> */}

          {/* Full Name Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('full_name')}</h3>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('first_name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            disabled={updateProfileMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('last_name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            disabled={updateProfileMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                {/* Profile Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileForm.reset()}
                    disabled={
                      updateProfileMutation.isPending ||
                      !profileForm.formState.isDirty
                    }
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      updateProfileMutation.isPending ||
                      !profileForm.formState.isDirty ||
                      !profileForm.formState.isValid
                    }
                  >
                    {t('save_changes')}
                    {updateProfileMutation.isPending && (
                      <Loader2 className="ml-2 size-4 animate-spin" />
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <Separator />

          {/* Contact Email Section */}
          {/* <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{t('contact_email')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('manage_email_description')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    placeholder="alexander.henderson@ticketbutler.de"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddEmail}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('add_another_email')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator /> */}

          {/* Password Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{t('password')}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('change_password_description')}
              </p>
            </div>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                {/* Row 1: Current Password (full width) */}
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('current_password')}</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder={t('enter_current_password')}
                          disabled={changePasswordMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <div className="min-h-[20px]">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Row 2: New Password and Confirm Password (2 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('new_password')}</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t('enter_new_password')}
                            disabled={changePasswordMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('confirm_password')}</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t('confirm_password')}
                            disabled={changePasswordMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                {/* Password Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      passwordForm.reset({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }
                    disabled={
                      changePasswordMutation.isPending ||
                      !passwordForm.formState.isDirty
                    }
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      changePasswordMutation.isPending ||
                      !passwordForm.formState.isDirty ||
                      !passwordForm.formState.isValid
                    }
                  >
                    {t('change_password')}
                    {changePasswordMutation.isPending && (
                      <Loader2 className="ml-2 size-4 animate-spin" />
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  )
}

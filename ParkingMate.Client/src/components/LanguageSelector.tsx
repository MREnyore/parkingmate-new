import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

interface Language {
  code: string
  name: string
  flag: string
}

interface LanguageSelectorProps {
  variant?: 'default' | 'compact'
  className?: string
}

const LANGUAGES: Language[] = [
  { code: 'de', name: 'DE', flag: '🇩🇪' },
  { code: 'en', name: 'EN', flag: '🇺🇸' }
]

export function LanguageSelector({
  variant = 'default',
  className
}: LanguageSelectorProps) {
  const { i18n, currentLanguage } = useTranslation()

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage)
  }

  const isCompact = variant === 'compact'

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger
          className={cn(
            'text-sm rounded-lg',
            isCompact ? 'w-20 h-8' : 'w-24 h-10'
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span className={isCompact ? 'text-xs' : 'text-sm'}>
                  {language.flag}
                </span>
                <span
                  className={cn(
                    'font-medium',
                    isCompact ? 'text-xs' : 'text-sm'
                  )}
                >
                  {language.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

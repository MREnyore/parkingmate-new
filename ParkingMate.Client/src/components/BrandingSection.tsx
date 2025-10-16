import { useTranslation } from '@/hooks/useTranslation'

interface BrandingSectionProps {
  backgroundText?: string
  backgroundTextDefault?: string
}

export const BrandingSection = ({
  backgroundText = 'the_parking_mate_company',
  backgroundTextDefault = 'THE\nPARKING\nMATE\nCOMPANY'
}: BrandingSectionProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex h-full bg-gray-100 items-center justify-center p-8 relative overflow-hidden">
      <div className="text-center relative z-10">
        {/* Large Typography Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[12rem] font-black text-gray-800 leading-none select-none opacity-80">
            {t(backgroundText, {
              defaultValue: backgroundTextDefault
            })
              .split('\n')
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i <
                    t(backgroundText, {
                      defaultValue: backgroundTextDefault
                    }).split('\n').length -
                      1 && <br />}
                </span>
              ))}
          </div>
        </div>

        {/* Centered Logo */}
        <div className="bg-blue-600 text-white p-8 rounded-2xl inline-block relative z-20 shadow-lg">
          <div className="text-4xl font-bold leading-tight">
            {t('parking_mate_full', { defaultValue: 'PARKING\nMATE' })
              .split('\n')
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i <
                    t('parking_mate_full', {
                      defaultValue: 'PARKING\nMATE'
                    }).split('\n').length -
                      1 && <br />}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

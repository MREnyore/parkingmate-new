import { Calendar, CheckCircle2, Download, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'
import { formatDateTime } from '@/utils/dateUtils'

interface SuccessStepProps {
  plateNumber: string
  validUntil?: string
}

export const SuccessStep = ({ plateNumber, validUntil }: SuccessStepProps) => {
  const { t } = useTranslation()

  // Fallback if validUntil is not provided (shouldn't happen in production)
  const validityDate = validUntil || new Date().toISOString()

  const handleDownload = () => {
    const content = `GÄSTEPARKAUSWEIS
    
Kennzeichen: ${plateNumber}
Gültig bis: ${formatDateTime(validityDate)}

Dieser Parkausweis gilt nur für diesen Besuch. Bei zukünftigen Besuchen müssen Sie entweder für das Parken bezahlen oder sich als Kunde registrieren.

---
PARK-MATE Parking Management System
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Gästeparkausweis-${plateNumber}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    const subject = 'Gästeparkausweis - PARK-MATE'
    const body = `Gästeparkausweis
    
Kennzeichen: ${plateNumber}
Gültig bis: ${formatDateTime(validityDate)}

Dieser Parkausweis gilt nur für diesen Besuch. Bei zukünftigen Besuchen müssen Sie entweder für das Parken bezahlen oder sich als Kunde registrieren.`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <motion.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="space-y-2"
      >
        <h3 className="text-2xl font-semibold text-gray-900">
          {t('guest_parking_approved', {
            defaultValue: 'Gästeparkplatz genehmigt!'
          })}
        </h3>
        <p className="text-gray-600">
          {t('guest_parking_success_message', {
            defaultValue:
              'Ihr einmaliger Gästeparkausweis wurde für das Kennzeichen'
          })}{' '}
          <span className="font-semibold text-gray-900">{plateNumber}</span>{' '}
          {t('granted', { defaultValue: 'erteilt' })}.
        </p>
      </motion.div>

      {/* Validity Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-center gap-2 text-green-900">
          <Calendar className="w-5 h-5" />
          <div className="text-sm">
            <span className="font-medium">
              {t('valid_until', { defaultValue: 'Gültig bis' })}:{' '}
            </span>
            <span className="font-semibold">
              {formatDateTime(validityDate)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <Button
          variant="outline"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {t('download', { defaultValue: 'Herunterladen' })}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          {t('share_via_email', { defaultValue: 'Per E-Mail teilen' })}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left"
      >
        <p className="text-sm text-blue-900">
          {t('guest_parking_info', {
            defaultValue:
              'Dieser Parkausweis gilt nur für diesen Besuch. Bei zukünftigen Besuchen müssen Sie entweder für das Parken bezahlen oder sich als Kunde registrieren.'
          })}
        </p>
      </motion.div>
    </motion.div>
  )
}

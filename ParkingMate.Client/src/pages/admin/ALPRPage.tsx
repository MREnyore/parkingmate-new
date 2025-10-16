import { Car, Clock, MapPin, ScanLine } from 'lucide-react'

import { DashboardLayout } from '@/components/DashboardLayout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'

export function ALPRPage() {
  const { t } = useTranslation()

  // Mock ALPR recognition data
  const recentRecognitions = [
    {
      id: 1,
      licensePlate: 'ABC-123',
      timestamp: '2024-01-17 14:30:22',
      location: 'Entrance Gate A',
      vehicle: 'BMW X5',
      confidence: 98.5,
      status: 'authorized'
    },
    {
      id: 2,
      licensePlate: 'XYZ-789',
      timestamp: '2024-01-17 14:25:15',
      location: 'Exit Gate B',
      vehicle: 'Mercedes C-Class',
      confidence: 95.2,
      status: 'authorized'
    },
    {
      id: 3,
      licensePlate: 'DEF-456',
      timestamp: '2024-01-17 14:20:08',
      location: 'Entrance Gate A',
      vehicle: 'Audi A4',
      confidence: 87.3,
      status: 'unauthorized'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authorized':
        return 'text-green-600 bg-green-50'
      case 'unauthorized':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('alpr_erkennungen_title')}
          </h1>
          <p className="text-muted-foreground">{t('alpr_description')}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('total_today')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">247</div>
              <p className="text-sm text-muted-foreground">
                {t('from_yesterday')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('authorized')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">234</div>
              <p className="text-sm text-muted-foreground">
                {t('success_rate')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('unauthorized')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">13</div>
              <p className="text-sm text-muted-foreground">{t('blocked')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('avg_confidence')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">93.2%</div>
              <p className="text-sm text-muted-foreground">
                {t('recognition_accuracy')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recognitions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">
                {t('recent_recognitions')}
              </CardTitle>
            </div>
            <CardDescription>{t('latest_alpr_detections')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecognitions.map((recognition) => (
                <div
                  key={recognition.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Car className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {recognition.licensePlate}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {recognition.vehicle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {recognition.location}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {recognition.timestamp}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {recognition.confidence}% {t('confidence')}
                      </div>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                          recognition.status
                        )}`}
                      >
                        {recognition.status === 'authorized'
                          ? t('authorized_status')
                          : t('unauthorized_status')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

import { Loader2, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void
  isPendingDeletion?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  itemName?: string
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  isPendingDeletion = false,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  itemName
}: DeleteConfirmationDialogProps) => {
  const handleClose =
    onCancel ||
    onClose ||
    (() => {
      // No-op fallback when no close handler is provided
    })
  const defaultTitle = itemName ? `Delete ${itemName}?` : 'Delete Item?'
  const defaultDescription = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this item? This action cannot be undone.'

  const handleConfirm = () => {
    if (!isPendingDeletion) {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 h-screen bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
                  <Trash2 size={20} />
                  {title || defaultTitle}
                </h2>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {description || defaultDescription}
              </p>

              {/* Footer */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPendingDeletion}
                >
                  {cancelText}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={isPendingDeletion}
                  className="min-w-[100px]"
                >
                  {isPendingDeletion ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      {confirmText}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

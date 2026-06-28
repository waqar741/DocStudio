import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      hideCloseButton
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDestructive ? 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)] dark:bg-[var(--color-danger-900)]' : 'bg-[var(--color-warning-50)] text-[var(--color-warning-600)] dark:bg-[#331c00]'}`}>
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-none tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      
      <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end pb-6 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
          {cancelText}
        </Button>
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  pendingLabel?: string
  cancelLabel?: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'Cancel',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => !pending && onCancel()}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="confirm-title" component="h2" variant="h6" sx={{ fontSize: '1.5rem', px: 3.5, pt: 3.5, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 3.5 }}>
        <DialogContentText id="confirm-description">{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 2, gap: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' }, '& > :not(style) + :not(style)': { ml: { xs: 0, sm: 0 } } }}>
        <Button variant="outlined" autoFocus disabled={pending} onClick={onCancel} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          disabled={pending}
          onClick={onConfirm}
          startIcon={pending ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {pending ? (pendingLabel ?? confirmLabel) : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

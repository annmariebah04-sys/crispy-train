import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { Chore, Completion } from '../types'

interface Props {
  completion: Completion
  chore?: Chore
  onClose: () => void
  footer?: React.ReactNode
}

const STATUS_LABEL: Record<Completion['status'], string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Waiting for approval',
}

export default function ProofModal({ completion, chore, onClose, footer }: Props) {
  const ts = completion.approvedAt ?? completion.submittedAt

  // Portaled to <body> — a modal nested inside a Framer Motion `layout`
  // ancestor would otherwise have its `fixed` positioning computed relative
  // to that ancestor's transformed box instead of the viewport.
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-sm overflow-hidden rounded-3xl"
      >
        {completion.photo && <img src={completion.photo} alt="" className="max-h-[60vh] w-full object-cover" />}
        {completion.note && <p className="max-h-[40vh] overflow-y-auto p-4 text-sm text-white/80">{completion.note}</p>}

        <div className="flex items-center justify-between p-4">
          <div>
            {chore && (
              <div className="font-medium">
                {chore.emoji} {chore.title}
              </div>
            )}
            <div className="text-xs text-white/40">
              {STATUS_LABEL[completion.status]} &middot;{' '}
              {new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            {completion.status === 'rejected' && completion.rejectionNote && (
              <div className="mt-1 text-xs text-rose-300">{completion.rejectionNote}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {footer && <div className="border-t border-white/10 p-4">{footer}</div>}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

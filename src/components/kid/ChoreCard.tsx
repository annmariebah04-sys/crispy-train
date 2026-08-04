import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Check, Loader2, X } from 'lucide-react'
import { fileToProofPhotoDataUrl } from '../../lib/image'
import type { Chore, Completion } from '../../types'

interface Props {
  chore: Chore
  completion?: Completion
  onComplete: (photo: string) => void
}

export default function ChoreCard({ chore, completion, onComplete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const done = Boolean(completion)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const photo = await fileToProofPhotoDataUrl(file)
      onComplete(photo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that photo, try another one.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div layout className="glass rounded-2xl p-4">
      <button
        onClick={() => (done ? setPreview(true) : fileInputRef.current?.click())}
        disabled={busy}
        className={`flex w-full items-center gap-4 text-left transition ${done ? 'opacity-60' : ''}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
          {chore.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-medium ${done ? 'line-through text-white/50' : ''}`}>{chore.title}</div>
          <div className="text-xs text-white/40">
            {done && completion
              ? `Done ${new Date(completion.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
              : `+${chore.points} pts · tap to snap a photo`}
          </div>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
            done ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/25 text-white/40'
          }`}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={16} strokeWidth={3} /> : <Camera size={14} />}
        </div>
      </button>
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      <AnimatePresence>
        {preview && completion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
            onClick={() => setPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm overflow-hidden rounded-3xl"
            >
              <img src={completion.photo} alt="" className="max-h-[70vh] w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{chore.title}</div>
                  <div className="text-xs text-white/40">
                    Completed {new Date(completion.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <button
                  onClick={() => setPreview(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

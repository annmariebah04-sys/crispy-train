import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2 } from 'lucide-react'
import { GRADIENT, KID_COLOR_OPTIONS, EMOJI_CHOICES } from '../../lib/theme'
import { fileToAvatarDataUrl, fileToBackgroundDataUrl } from '../../lib/image'
import type { Kid } from '../../types'

type Patch = Partial<Pick<Kid, 'emoji' | 'color' | 'photo' | 'background'>>

interface Props {
  open: boolean
  kid: Pick<Kid, 'emoji' | 'color' | 'photo' | 'background'>
  onUpdate: (patch: Patch) => void
  onClose: () => void
}

export default function AvatarPicker({ open, kid, onUpdate, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'photo' | 'background' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setBusy('photo')
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      onUpdate({ photo: dataUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load that photo, try another one.")
    } finally {
      setBusy(null)
    }
  }

  async function handleBackgroundFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setBusy('background')
    try {
      const dataUrl = await fileToBackgroundDataUrl(file)
      onUpdate({ background: dataUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load that image, try another one.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="glass max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Pick your look</h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white">
                <X size={15} />
              </button>
            </div>

            <div
              className={`mx-auto mt-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${GRADIENT[kid.color]} text-4xl`}
            >
              {kid.photo ? <img src={kid.photo} alt="" className="h-full w-full object-cover" /> : kid.emoji}
            </div>

            <div className="mt-5 flex justify-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={busy !== null}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
              >
                <Upload size={13} /> {busy === 'photo' ? 'Uploading…' : 'Upload photo'}
              </button>
              {kid.photo && (
                <button
                  onClick={() => onUpdate({ photo: undefined })}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/15 hover:text-white"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
            {error && <p className="mt-2 text-center text-xs text-rose-400">{error}</p>}

            <div className="mt-6">
              <label className="mb-2 block text-xs text-white/50">
                {kid.photo ? 'Or use an emoji instead' : 'Avatar'}
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    onClick={() => onUpdate({ emoji: e, photo: undefined })}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition ${
                      !kid.photo && kid.emoji === e ? 'bg-fuchsia-500/30 ring-2 ring-fuchsia-400' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs text-white/50">Color</label>
              <div className="flex flex-wrap justify-center gap-3">
                {KID_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onUpdate({ color: c })}
                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${GRADIENT[c]} transition ${
                      kid.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141f]' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs text-white/50">Background</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                  {kid.background ? (
                    <img src={kid.background} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${GRADIENT[kid.color]} opacity-30`} />
                  )}
                </div>
                <div className="flex flex-1 flex-wrap gap-2">
                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundFile}
                  />
                  <button
                    onClick={() => bgInputRef.current?.click()}
                    disabled={busy !== null}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                  >
                    <Upload size={13} /> {busy === 'background' ? 'Uploading…' : 'Upload background'}
                  </button>
                  {kid.background && (
                    <button
                      onClick={() => onUpdate({ background: undefined })}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/15 hover:text-white"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

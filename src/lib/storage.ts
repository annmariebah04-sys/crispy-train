import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { familyId, storage } from './firebase'

const MAX_VIDEO_BYTES = 25 * 1024 * 1024 // 25 MB — a short clip is plenty of proof

// Chore-proof videos go to Firebase Storage (Firestore's 1 MiB document cap
// makes it useless for video) — only the resulting download URL string ends
// up in the completion document.
export async function uploadProofVideo(file: File, kidId: string, choreId: string, dayKey: string): Promise<string> {
  if (!file.type.startsWith('video/')) throw new Error('Please choose a video file.')
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('That video is too big — keep it under 25MB (a few seconds is plenty).')
  }
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'mp4'
  const path = `families/${familyId}/proofs/${kidId}_${choreId}_${dayKey}_${Date.now()}.${ext}`
  const objRef = ref(storage, path)
  await uploadBytes(objRef, file, { contentType: file.type })
  return getDownloadURL(objRef)
}

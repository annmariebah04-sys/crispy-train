function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image'))
      img.onload = () => resolve(img)
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

function dataUrlByteLength(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.ceil((base64.length * 3) / 4)
}

// Kid profile docs live in a single Firestore document (1 MiB cap) alongside
// a photo and a background, so each image gets its own conservative budget.
const AVATAR_BUDGET_BYTES = 150_000
const BACKGROUND_BUDGET_BYTES = 650_000
const PROOF_PHOTO_BUDGET_BYTES = 250_000

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return canvas.toDataURL('image/jpeg', quality)
}

// Reads an image file, center-crops it to a square, and downsizes it so
// avatar photos stay well under Firestore's per-document size limit.
export async function fileToAvatarDataUrl(file: File, size = 256): Promise<string> {
  const img = await loadImageFromFile(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  const scale = Math.max(size / img.width, size / img.height)
  const w = img.width * scale
  const h = img.height * scale
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)

  for (const quality of [0.8, 0.6, 0.4]) {
    const url = canvasToJpeg(canvas, quality)
    if (dataUrlByteLength(url) <= AVATAR_BUDGET_BYTES) return url
  }
  throw new Error('That photo is too detailed to shrink down enough — try a simpler one.')
}

// Reads an image file and downsizes it (preserving aspect ratio) for use as
// a full-bleed background — no cropping, CSS `object-cover` handles framing.
export async function fileToBackgroundDataUrl(file: File, maxDim = 1280): Promise<string> {
  const img = await loadImageFromFile(file)
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.drawImage(img, 0, 0, w, h)

  for (const quality of [0.72, 0.55, 0.4]) {
    const url = canvasToJpeg(canvas, quality)
    if (dataUrlByteLength(url) <= BACKGROUND_BUDGET_BYTES) return url
  }
  throw new Error('That image is too detailed to shrink down enough — try a simpler one.')
}

// Reads an image file and downsizes it (preserving aspect ratio) for use as
// a chore-completion proof photo.
export async function fileToProofPhotoDataUrl(file: File, maxDim = 900): Promise<string> {
  const img = await loadImageFromFile(file)
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  ctx.drawImage(img, 0, 0, w, h)

  for (const quality of [0.75, 0.6, 0.45]) {
    const url = canvasToJpeg(canvas, quality)
    if (dataUrlByteLength(url) <= PROOF_PHOTO_BUDGET_BYTES) return url
  }
  throw new Error('That photo is too detailed to shrink down enough — try a simpler one.')
}

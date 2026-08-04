import { GRADIENT, GLOW } from '../lib/theme'
import type { Kid } from '../types'

interface Props {
  kid: Pick<Kid, 'emoji' | 'color' | 'photo'>
  className?: string
  glow?: boolean
}

export default function KidAvatar({ kid, className = 'h-16 w-16 text-3xl', glow = false }: Props) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${GRADIENT[kid.color]} ${
        glow ? GLOW[kid.color] : ''
      } ${className}`}
    >
      {kid.photo ? (
        <img src={kid.photo} alt="" className="h-full w-full object-cover" />
      ) : (
        kid.emoji
      )}
    </div>
  )
}

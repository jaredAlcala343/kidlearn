'use client'

interface StarsProps {
  count: number
  max?: number
}

export default function Stars({ count, max = 5 }: StarsProps) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="text-2xl transition-all duration-300"
          style={{
            filter: i < count ? 'none' : 'grayscale(100%) opacity(0.3)',
            transform: i < count ? 'scale(1)' : 'scale(0.85)',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  color: string
  size: number
  duration: number
  delay: number
  emoji: string
}

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🌸', '🍀', '💫', '🌺']
const COLORS = ['#8BAF7C', '#7EB8D4', '#E8A87C', '#A89BC8', '#D4B896']

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 16 + Math.random() * 16,
        duration: 1.5 + Math.random() * 2,
        delay: Math.random() * 0.5,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      }))
      setParticles(newParticles)
      const timer = setTimeout(() => setParticles([]), 3000)
      return () => clearTimeout(timer)
    }
  }, [active])

  if (!particles.length) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute confetti-particle"
          style={{
            left: `${p.x}%`,
            top: '-30px',
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}

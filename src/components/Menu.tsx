'use client'

import { GameMode } from '@/lib/gameData'

interface MenuProps {
  onSelect: (mode: GameMode) => void
}

const MODES = [
  {
    mode: 'letters' as GameMode,
    label: 'Letras',
    emoji: '🔤',
    desc: 'Aprende el abecedario con imágenes y pon a prueba lo que sabes con un quiz divertido.',
    bg: '#EEF6FB',
    border: '#B3D9EC',
    accent: '#7EB8D4',
    tag: 'Aprender + Quiz',
  },
  {
    mode: 'numbers' as GameMode,
    label: 'Números',
    emoji: '🔢',
    desc: 'Cuenta los emojis tocándolos uno a uno y elige el número correcto.',
    bg: '#EEF7EA',
    border: '#B8D4AC',
    accent: '#8BAF7C',
    tag: 'Contar + Elegir',
  },
  {
    mode: 'words' as GameMode,
    label: 'Palabras',
    emoji: '📝',
    desc: 'Mira la imagen, descubre la palabra y coloca las letras en el orden correcto.',
    bg: '#FDF3EA',
    border: '#F5C9A8',
    accent: '#E8A87C',
    tag: 'Armar letras',
  },
]

export default function Menu({ onSelect }: MenuProps) {
  return (
    <div>
      {/* Section title */}
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#3D3D3D', marginBottom: '24px' }}>
        ¿Qué quieres aprender hoy?
      </h2>

      {/* Mode cards — responsive grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
        {MODES.map(m => (
          <button
            key={m.mode}
            onClick={() => onSelect(m.mode)}
            style={{
              backgroundColor: m.bg,
              border: `2px solid ${m.border}`,
              borderRadius: '20px',
              padding: '28px 24px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{m.emoji}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#3D3D3D' }}>{m.label}</h3>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', backgroundColor: m.accent, color: 'white' }}>
                {m.tag}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B6B6B', fontWeight: 600, lineHeight: 1.5 }}>{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Tips section */}
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '28px 32px', border: '2px solid #EDE8DF' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#3D3D3D' }}>💡 Consejos para papás y mamás</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: '🔊', tip: 'Activa el sonido para que el niño escuche las letras y palabras pronunciadas.' },
            { icon: '⏱️', tip: 'Sesiones cortas de 5-10 minutos son más efectivas que largas.' },
            { icon: '🎯', tip: 'Empieza por "Letras", luego "Números" y finalmente "Palabras".' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{t.icon}</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B6B6B', fontWeight: 600, lineHeight: 1.5 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

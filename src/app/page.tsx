'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameMode } from '@/lib/gameData'
import Menu from '@/components/Menu'
import LettersGame from '@/components/LettersGame'
import NumbersGame from '@/components/NumbersGame'
import WordsGame from '@/components/WordsGame'
import { playPhrase, initAudio, startBgMusic, stopBgMusic, preloadCriticalAudio } from '@/lib/sounds'

const GAME_META: Record<string, { label: string; emoji: string; accent: string; light: string; desc: string }> = {
  letters: { label: 'Letras',   emoji: '🔤', accent: '#7EB8D4', light: '#EEF6FB', desc: 'Explora el abecedario y pon a prueba lo que sabes' },
  numbers: { label: 'Números',  emoji: '🔢', accent: '#8BAF7C', light: '#EEF7EA', desc: 'Aprende a contar del 1 al 10 con animaciones' },
  words:   { label: 'Palabras', emoji: '📝', accent: '#E8A87C', light: '#FDF3EA', desc: 'Forma palabras colocando las letras en orden' },
}

export default function Home() {
  const [mode, setMode]       = useState<GameMode>('menu')
  const [musicOn, setMusicOn] = useState(false)
  const [audioInit, setAudioInit] = useState(false)

  // Unlock audio on first tap and start music
  const handleFirstInteraction = useCallback(() => {
    if (audioInit) return
    setAudioInit(true)
    initAudio()
    preloadCriticalAudio()
    setTimeout(() => {
      startBgMusic()
      setMusicOn(true)
    }, 500)
  }, [audioInit])

  useEffect(() => {
    document.addEventListener('pointerdown', handleFirstInteraction, { once: true })
    return () => document.removeEventListener('pointerdown', handleFirstInteraction)
  }, [handleFirstInteraction])

  const toggleMusic = useCallback(() => {
    if (musicOn) {
      stopBgMusic()
      setMusicOn(false)
    } else {
      initAudio()
      startBgMusic()
      setMusicOn(true)
    }
  }, [musicOn])

  const handleSelect = (m: GameMode) => {
    initAudio()
    playPhrase(`nav-${m}`, `Vamos a aprender ${GAME_META[m]?.label ?? ''}`)
    setMode(m)
  }

  const handleBack = () => {
    playPhrase('nav-menu', 'Menú principal')
    setMode('menu')
  }

  const meta = mode !== 'menu' ? GAME_META[mode] : null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F0', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ backgroundColor: 'white', borderBottom: '2px solid #EDE8DF', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>

          {/* Logo */}
          <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: '26px' }}>🦉</span>
            <span style={{ fontSize: '19px', fontWeight: 900, color: '#3D3D3D', letterSpacing: '-0.5px' }}>KidLearn</span>
          </button>

          {/* Nav — visible when in a game */}
          {mode !== 'menu' && (
            <nav style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(GAME_META).map(([key, m]) => (
                <button key={key} onClick={() => handleSelect(key as GameMode)}
                  style={{
                    padding: '6px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
                    border: mode === key ? 'none' : '2px solid #EDE8DF',
                    cursor: 'pointer',
                    backgroundColor: mode === key ? m.accent : 'white',
                    color: mode === key ? 'white' : '#6B6B6B',
                    boxShadow: mode === key ? `0 3px 8px ${m.accent}66` : 'none',
                    transition: 'all 0.18s',
                  }}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            {/* Music toggle */}
            <button
              onClick={() => { initAudio(); toggleMusic() }}
              title={musicOn ? 'Silenciar música' : 'Activar música'}
              style={{
                width: '38px', height: '38px', borderRadius: '12px',
                backgroundColor: musicOn ? '#EEF7EA' : '#F5F2EE',
                border: `2px solid ${musicOn ? '#8BAF7C' : '#DDD5C8'}`,
                fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {musicOn ? '🎵' : '🔇'}
            </button>

            {mode !== 'menu' && (
              <button onClick={handleBack}
                style={{ padding: '7px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', backgroundColor: '#F0EBE3', border: 'none', color: '#6B6B6B', cursor: 'pointer' }}>
                ← Menú
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO (menu only) ── */}
      {mode === 'menu' && (
        <div style={{ background: 'linear-gradient(160deg, #EEF6FB 0%, #EEF7EA 55%, #FDF3EA 100%)', borderBottom: '2px solid #EDE8DF', padding: '60px 24px 52px' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '76px', marginBottom: '18px', lineHeight: 1 }} className="animate-float">🦉</div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#3D3D3D', margin: '0 0 14px', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Aprendo Jugando
            </h1>
            <p style={{ fontSize: '18px', color: '#6B6B6B', fontWeight: 600, margin: '0 0 32px', lineHeight: 1.5 }}>
              Letras, números y palabras.<br/>¡Explora y aprende a tu ritmo!
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(GAME_META).map(([key, m]) => (
                <button key={key} onClick={() => handleSelect(key as GameMode)}
                  style={{
                    padding: '13px 26px', borderRadius: '16px', fontWeight: 800, fontSize: '15px',
                    backgroundColor: m.accent, color: 'white', border: 'none', cursor: 'pointer',
                    boxShadow: `0 5px 0 ${m.accent}BB`, transition: 'transform 0.13s',
                  }}
                  className="active:scale-95">
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            {/* Music hint on first visit */}
            {!audioInit && (
              <p style={{ marginTop: '24px', fontSize: '13px', color: '#6B6B6B', fontWeight: 600 }}>
                🎵 Toca cualquier botón para activar la música
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {mode === 'menu' && <Menu onSelect={handleSelect} />}

        {mode !== 'menu' && meta && (
          <>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                backgroundColor: meta.light, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', border: `2px solid ${meta.accent}44`, flexShrink: 0,
              }}>
                {meta.emoji}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#3D3D3D' }}>{meta.label}</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#6B6B6B', fontWeight: 600 }}>{meta.desc}</p>
              </div>
            </div>

            {/* Game card */}
            <div style={{
              backgroundColor: 'white', borderRadius: '28px',
              padding: 'clamp(24px, 4vw, 52px)',
              border: '2px solid #EDE8DF',
              boxShadow: '0 6px 32px rgba(0,0,0,0.07)',
            }}>
              {mode === 'letters' && <LettersGame />}
              {mode === 'numbers' && <NumbersGame />}
              {mode === 'words'   && <WordsGame />}
            </div>
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '2px solid #EDE8DF', backgroundColor: 'white', padding: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#6B6B6B', fontWeight: 600, fontSize: '14px' }}>
          🦉 KidLearn · Hecho con amor para niños pequeños
        </p>
      </footer>
    </div>
  )
}

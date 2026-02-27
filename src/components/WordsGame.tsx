'use client'

import { useState, useCallback } from 'react'
import { WORDS_ES } from '@/lib/gameData'
import { playWord, playLetter, playSparkleTone, playWrongTone, playCelebrationVoice, playCorrect, playTryAgain, initAudio } from '@/lib/sounds'
import Confetti from './Confetti'

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

const EXTRA_POOL = 'AEIOULMNRSPTVDGBFC'

function buildState(wd: typeof WORDS_ES[0]) {
  const extras = shuffle(EXTRA_POOL.split('').filter(c => !new Set(wd.letters).has(c))).slice(0, 3)
  return {
    placed: new Array(wd.letters.length).fill(null) as (string | null)[],
    available: shuffle([...wd.letters, ...extras]),
  }
}

export default function WordsGame() {
  const [wordQueue] = useState(() => shuffle([...WORDS_ES]))
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState(() => buildState(WORDS_ES[0]))
  const [correct, setCorrect] = useState(false)
  const [wrongAnim, setWrongAnim] = useState(false)
  const [streak, setStreak] = useState(0)
  const [total, setTotal] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const wordData = wordQueue[idx % wordQueue.length]

  const handlePlaceLetter = useCallback((letter: string, fromIdx: number) => {
    if (correct) return
    initAudio()
    playLetter(letter)

    setState(prev => {
      const newPlaced = [...prev.placed]
      const slot = newPlaced.indexOf(null)
      if (slot === -1) return prev
      newPlaced[slot] = letter
      const newAvail = [...prev.available]
      newAvail.splice(fromIdx, 1)

      if (newPlaced.every(p => p !== null)) {
        const formed = newPlaced.join('')
        const target = wordData.letters.join('')
        if (formed === target) {
          setCorrect(true)
          setTotal(t => t + 1)
          playSparkleTone()
          const ns = streak + 1
          setStreak(ns)
          if (ns % 5 === 0) {
            playCelebrationVoice()
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 3000)
          } else {
            setTimeout(() => playWord(wordData.word), 400)
          }
        } else {
          setTotal(t => t + 1)
          setWrongAnim(true)
          playWrongTone()
          playTryAgain()
          setTimeout(() => {
            setWrongAnim(false)
            setState(buildState(wordData))
          }, 700)
          return { placed: newPlaced, available: newAvail }
        }
      }
      return { placed: newPlaced, available: newAvail }
    })
  }, [correct, wordData, streak])

  const handleRemoveLetter = useCallback((slotIdx: number) => {
    if (correct || state.placed[slotIdx] === null) return
    const letter = state.placed[slotIdx]!
    playLetter(letter)
    setState(prev => {
      const newPlaced = [...prev.placed]
      newPlaced[slotIdx] = null
      return { placed: newPlaced, available: [...prev.available, letter] }
    })
  }, [correct, state.placed])

  const handleNext = useCallback(() => {
    const nextIdx = idx + 1
    setIdx(nextIdx)
    setState(buildState(wordQueue[nextIdx % wordQueue.length]))
    setCorrect(false)
    setAnimKey(k => k + 1)
  }, [idx, wordQueue])

  const accuracy = total > 0 ? Math.round((streak / total) * 100) : 0

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <Confetti active={showConfetti} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Racha', value: streak, emoji: '🔥' },
          { label: 'Intentos', value: total, emoji: '✏️' },
          { label: 'Aciertos', value: `${accuracy}%`, emoji: '🎯' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, backgroundColor: 'white', borderRadius: '16px', padding: '12px', textAlign: 'center', border: '2px solid #EDE8DF' }}>
            <p style={{ margin: '0 0 2px', fontSize: '18px' }}>{s.emoji}</p>
            <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: 900, color: '#3D3D3D' }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B6B6B', fontWeight: 700 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div key={animKey} className="slide-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'start' }}>

          {/* Left: emoji */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => { initAudio(); playWord(wordData.word) }}
              style={{
                width: '120px', height: '120px', borderRadius: '28px',
                backgroundColor: '#FDF3EA', border: '3px solid #F5C9A8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4rem', cursor: 'pointer', transition: 'transform 0.15s',
              }}
              className="animate-float active:scale-90"
            >
              {wordData.emoji}
            </button>
            <p style={{ margin: 0, fontSize: '11px', color: '#6B6B6B', fontWeight: 600, textAlign: 'center' }}>
              🔊 Toca para escuchar
            </p>
            {/* Word hint if correct */}
            {correct && (
              <p className="pop" style={{
                margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#3D3D3D',
                letterSpacing: '3px', textAlign: 'center',
              }}>
                {wordData.word}
              </p>
            )}
          </div>

          {/* Right: game */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Answer slots */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#6B6B6B' }}>
                Forma la palabra:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} className={wrongAnim ? 'wrong-shake' : ''}>
                {state.placed.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleRemoveLetter(i)}
                    style={{
                      width: '58px', height: '64px', borderRadius: '16px',
                      fontSize: '24px', fontWeight: 900,
                      border: `3px solid ${correct ? '#5E8A4E' : p ? '#E8A87C' : '#E0D8CE'}`,
                      backgroundColor: correct ? '#B8D4AC' : p ? '#FDF3EA' : '#F8F5F0',
                      color: '#3D3D3D', cursor: p && !correct ? 'pointer' : 'default',
                      transition: 'all 0.18s',
                      boxShadow: p && !correct ? '0 3px 0 #D4A068' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {p ?? ''}
                  </button>
                ))}
              </div>
              {!correct && state.placed.some(p => p) && (
                <button
                  onClick={() => setState(buildState(wordData))}
                  style={{
                    marginTop: '8px', fontSize: '12px', fontWeight: 700, padding: '4px 12px',
                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                    backgroundColor: '#F0EBE3', color: '#6B6B6B',
                  }}
                >
                  ↺ Borrar todo
                </button>
              )}
            </div>

            {/* Available letters */}
            {!correct && (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#6B6B6B' }}>
                  Letras disponibles:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {state.available.map((letter, i) => (
                    <button
                      key={i}
                      onClick={() => handlePlaceLetter(letter, i)}
                      style={{
                        width: '58px', height: '64px', borderRadius: '16px',
                        fontSize: '22px', fontWeight: 900,
                        border: 'none', backgroundColor: '#E8A87C', color: 'white',
                        cursor: 'pointer', boxShadow: '0 4px 0 #C47D47',
                        transition: 'all 0.12s',
                      }}
                      className="active:scale-90"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Success */}
            {correct && (
              <div className="pop" style={{
                padding: '20px', borderRadius: '20px',
                backgroundColor: '#EEF7EA', border: '3px solid #B8D4AC',
              }}>
                <p style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 900, color: '#1A4A10' }}>
                  🎉 ¡Escribiste <strong>{wordData.word}</strong>!
                </p>
                <button
                  onClick={handleNext}
                  style={{
                    padding: '10px 24px', borderRadius: '14px',
                    backgroundColor: '#8BAF7C', color: 'white',
                    fontWeight: 700, fontSize: '15px', border: 'none',
                    cursor: 'pointer', boxShadow: '0 4px 0 #5E8A4E',
                  }}
                  className="active:scale-95 transition-transform"
                >
                  Siguiente → ({idx + 2} / {wordQueue.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { LETTERS, LetterItem, WordEntry } from '@/lib/gameData'
import { speak, speakLetterWord, speakWord, playSparkleTone, playWrongTone, speakCelebration, initAudio } from '@/lib/sounds'
import Confetti from './Confetti'

type Tab = 'explore' | 'quiz'
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

interface QuizCard {
  correctLetter: LetterItem
  entry: WordEntry
  options: LetterItem[]
}

// Build a quiz avoiding the last letter used
let lastLetter = ''
function buildQuiz(): QuizCard {
  const all = LETTERS
  // Avoid repeating same letter twice in a row
  const pool = all.filter(l => l.letter !== lastLetter)
  const correctLetter = pool[Math.floor(Math.random() * pool.length)]
  lastLetter = correctLetter.letter
  // Pick a RANDOM word from this letter's pool
  const entry = correctLetter.words[Math.floor(Math.random() * correctLetter.words.length)]
  // Distractors: 3 random DIFFERENT letters, also shuffled from a wide pool
  const distractors = shuffle(all.filter(x => x.letter !== correctLetter.letter)).slice(0, 3)
  return {
    correctLetter,
    entry,
    options: shuffle([correctLetter, ...distractors]),
  }
}

// ── Explore Tab ───────────────────────────────────────────────────────────────
function ExploreTab() {
  const [active,     setActive]     = useState<LetterItem | null>(null)
  const [activeWord, setActiveWord] = useState<WordEntry  | null>(null)
  const [bounce,     setBounce]     = useState('')

  const handleTap = useCallback((item: LetterItem) => {
    initAudio()
    // Each tap picks a fresh random word from the letter's pool
    const entry = item.words[Math.floor(Math.random() * item.words.length)]
    setActive(item)
    setActiveWord(entry)
    setBounce(item.letter)
    speakLetterWord(item.letter, entry.word)
    setTimeout(() => setBounce(''), 500)
  }, [])

  const cycleWord = useCallback(() => {
    if (!active) return
    initAudio()
    // Rotate to next word (not the current one)
    const others = active.words.filter(w => w.word !== activeWord?.word)
    const next = others[Math.floor(Math.random() * others.length)] ?? active.words[0]
    setActiveWord(next)
    speakLetterWord(active.letter, next.word)
  }, [active, activeWord])

  return (
    <div>
      {/* Alphabet grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {LETTERS.map(item => (
          <button key={item.letter} onClick={() => handleTap(item)}
            style={{
              aspectRatio: '1', borderRadius: '18px',
              border: `3px solid ${active?.letter === item.letter ? item.color : item.color + '44'}`,
              backgroundColor: active?.letter === item.letter ? item.color : item.color + '18',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
              cursor: 'pointer', transition: 'all 0.18s',
              transform: bounce === item.letter ? 'scale(1.22)' : 'scale(1)',
              boxShadow: active?.letter === item.letter ? `0 4px 18px ${item.color}66` : 'none',
            }}>
            <span style={{ fontSize: 'clamp(1.3rem,4vw,2rem)', fontWeight: 900, color: active?.letter === item.letter ? 'white' : item.color, lineHeight: 1 }}>
              {item.letter}
            </span>
            <span style={{ fontSize: 'clamp(0.85rem,2.5vw,1.2rem)', lineHeight: 1 }}>
              {item.words[0].emoji}
            </span>
          </button>
        ))}
      </div>

      {/* Detail card */}
      {active && activeWord ? (
        <div className="pop" style={{
          borderRadius: '24px', padding: '24px 28px',
          backgroundColor: active.color + '16', border: `3px solid ${active.color}55`,
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Letter badge */}
            <div style={{
              width: '84px', height: '84px', borderRadius: '20px', flexShrink: 0,
              backgroundColor: active.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(2.8rem,8vw,3.5rem)', fontWeight: 900, color: 'white',
              boxShadow: `0 5px 0 ${active.color}99`,
            }}>
              {active.letter}
            </div>

            {/* Word info */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '2.6rem' }}>{activeWord.emoji}</span>
                <p style={{ margin: 0, fontSize: 'clamp(1.4rem,4vw,2.2rem)', fontWeight: 900, color: '#3D3D3D', letterSpacing: '2px' }}>
                  <span style={{ color: active.color }}>{active.letter}</span>
                  {activeWord.word.slice(1).toLowerCase()}
                </p>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6B6B6B', fontWeight: 600 }}>
                {active.letter} de <strong>{activeWord.word}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => speakLetterWord(active.letter, activeWord.word)}
                  style={{ padding: '7px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, backgroundColor: active.color, color: 'white', border: 'none', cursor: 'pointer' }}>
                  🔊 Escuchar
                </button>
                {active.words.length > 1 && (
                  <button onClick={cycleWord}
                    style={{ padding: '7px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, backgroundColor: 'white', color: active.color, border: `2px solid ${active.color}`, cursor: 'pointer' }}>
                    🔄 Otra palabra
                  </button>
                )}
              </div>
            </div>

            {/* All words for this letter as pills */}
            <div style={{ width: '100%', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {active.words.map(w => (
                <button key={w.word} onClick={() => { setActiveWord(w); speakLetterWord(active.letter, w.word) }}
                  style={{
                    padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                    backgroundColor: activeWord.word === w.word ? active.color : active.color + '22',
                    color: activeWord.word === w.word ? 'white' : active.color,
                    border: 'none', cursor: 'pointer',
                  }}>
                  {w.emoji} {w.word}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '28px', borderRadius: '20px', backgroundColor: '#F5F2EE' }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#6B6B6B', fontWeight: 600 }}>
            👆 Toca cualquier letra para explorarla
          </p>
        </div>
      )}
    </div>
  )
}

// ── Quiz Tab ──────────────────────────────────────────────────────────────────
function QuizTab() {
  const [quiz,      setQuiz]      = useState<QuizCard>(buildQuiz)
  const [selected,  setSelected]  = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [streak,    setStreak]    = useState(0)
  const [total,     setTotal]     = useState(0)
  const [showConf,  setShowConf]  = useState(false)
  const [animKey,   setAnimKey]   = useState(0)

  // Auto-speak word on new question
  useEffect(() => {
    const t = setTimeout(() => { initAudio(); speakWord(quiz.entry.word) }, 500)
    return () => clearTimeout(t)
  }, [animKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextQuestion = useCallback(() => {
    const q = buildQuiz()
    setQuiz(q)
    setSelected(null)
    setIsCorrect(null)
    setAnimKey(k => k + 1)
  }, [])

  const handleAnswer = useCallback((letter: string) => {
    if (selected) return
    initAudio()
    setSelected(letter)
    const correct = letter === quiz.correctLetter.letter
    setIsCorrect(correct)
    setTotal(t => t + 1)

    if (correct) {
      playSparkleTone()
      const ns = streak + 1
      setStreak(ns)
      if (ns % 5 === 0) {
        speakCelebration()
        setShowConf(true)
        setTimeout(() => setShowConf(false), 3000)
      } else {
        const ok = ['¡Muy bien!', '¡Correcto!', '¡Bravo!', '¡Sí!', '¡Genial!', '¡Súper!']
        setTimeout(() => speak(ok[Math.floor(Math.random() * ok.length)], 0.88, 1.15, true), 200)
      }
      setTimeout(nextQuestion, 1200)
    } else {
      playWrongTone()
      setTimeout(() => speak('¡Inténtalo de nuevo!', 0.82, 1.1, true), 220)
      setTimeout(() => { setSelected(null); setIsCorrect(null) }, 1000)
    }
  }, [selected, quiz, streak, nextQuestion])

  return (
    <div>
      <Confetti active={showConf} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {([['🔥','Racha',streak],['❓','Preguntas',total],['🎯','Aciertos', total>0?`${Math.round(streak/total*100)}%`:'–']] as [string,string,string|number][]).map(([e,l,v]) => (
          <div key={l} style={{ flex:1, background:'white', borderRadius:'16px', padding:'12px', textAlign:'center', border:'2px solid #EDE8DF' }}>
            <p style={{margin:'0 0 2px',fontSize:'18px'}}>{e}</p>
            <p style={{margin:'0 0 2px',fontSize:'22px',fontWeight:900,color:'#3D3D3D'}}>{v}</p>
            <p style={{margin:0,fontSize:'11px',color:'#6B6B6B',fontWeight:700}}>{l}</p>
          </div>
        ))}
      </div>

      <div key={animKey} className="slide-in">
        <p style={{ textAlign:'center', fontSize:'17px', fontWeight:800, color:'#6B6B6B', marginBottom:'18px' }}>
          ¿Con qué letra empieza <span style={{color:'#3D3D3D'}}>{quiz.entry.word}</span>?
        </p>

        {/* Clue card */}
        <div onClick={() => { initAudio(); speakWord(quiz.entry.word) }}
          style={{
            borderRadius:'24px', padding:'28px 20px', marginBottom:'24px', cursor:'pointer',
            backgroundColor: quiz.correctLetter.color + '14',
            border: `3px solid ${quiz.correctLetter.color}44`,
            display:'flex', flexDirection:'column', alignItems:'center', gap:'10px',
          }}>
          <span style={{ fontSize:'clamp(4rem,12vw,6rem)' }}>{quiz.entry.emoji}</span>
          <p style={{ margin:0, fontSize:'clamp(1.6rem,5vw,2.4rem)', fontWeight:900, color:'#3D3D3D', letterSpacing:'4px' }}>
            {quiz.entry.word}
          </p>
          <p style={{ margin:0, fontSize:'12px', color:'#6B6B6B', fontWeight:600 }}>🔊 Toca para escuchar</p>
        </div>

        {/* 4 letter options 2×2 */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {quiz.options.map(opt => {
            let bg='white', border='#DDD5C8', col='#3D3D3D', shadow='0 4px 0 #C0B5A0', icon=''
            if (selected===opt.letter) {
              if (isCorrect)  { bg='#B8D4AC'; border='#5E8A4E'; col='#1A4A10'; shadow='none'; icon='✓ ' }
              else            { bg='#F5C9A8'; border='#C47D47'; col='#7A2A00'; shadow='none'; icon='✗ ' }
            }
            return (
              <button key={opt.letter} onClick={() => handleAnswer(opt.letter)}
                style={{
                  padding:'20px 12px', borderRadius:'20px',
                  border:`3px solid ${border}`, backgroundColor:bg, color:col,
                  fontWeight:900, fontSize:'clamp(2rem,8vw,3.5rem)',
                  boxShadow:shadow, cursor:'pointer', transition:'all 0.15s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'4px',
                }} className="active:scale-90">
                {icon && <span style={{fontSize:'1rem'}}>{icon}</span>}
                {opt.letter}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LettersGame() {
  const [tab, setTab] = useState<Tab>('explore')
  return (
    <div style={{ maxWidth:'680px', margin:'0 auto' }}>
      <div style={{ display:'flex', gap:'8px', marginBottom:'28px', padding:'6px', borderRadius:'20px', backgroundColor:'#EEF6FB' }}>
        {(['explore','quiz'] as const).map(id => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex:1, padding:'12px 8px', borderRadius:'14px', border:'none', cursor:'pointer',
              backgroundColor: tab===id ? '#7EB8D4' : 'transparent',
              color: tab===id ? 'white' : '#6B6B6B',
              fontWeight: tab===id ? 800 : 600, transition:'all 0.2s',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
            }}>
            <span style={{fontSize:'15px'}}>{id==='explore' ? '🔍 Explorar' : '🎯 Quiz'}</span>
            <span style={{fontSize:'11px',opacity:0.8}}>{id==='explore' ? 'Ve todo el abecedario' : 'Pon a prueba lo que sabes'}</span>
          </button>
        ))}
      </div>
      {tab==='explore' && <ExploreTab />}
      {tab==='quiz'    && <QuizTab />}
    </div>
  )
}

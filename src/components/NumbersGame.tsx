'use client'

import { useState, useCallback, useRef } from 'react'
import { NUMBERS } from '@/lib/gameData'
import {
  playNumber, playSparkleTone, playWrongTone, playCountBlip,
  playCelebrationVoice, playCorrect, playTryAgain,
  startCountSequence, initAudio
} from '@/lib/sounds'
import Confetti from './Confetti'

type Tab = 'explore' | 'quiz'
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

// ── Explore ───────────────────────────────────────────────────────────────────
function ExploreTab() {
  const [active,      setActive]      = useState(NUMBERS[0])
  const [highlighted, setHighlighted] = useState<number[]>([])
  const [counting,    setCounting]    = useState(false)
  const [currentNum,  setCurrentNum]  = useState(0)
  const cancelRef = useRef<(() => void) | null>(null)

  const handleSelect = useCallback((item: typeof NUMBERS[0]) => {
    initAudio()
    cancelRef.current?.(); cancelRef.current = null
    setCounting(false); setHighlighted([]); setCurrentNum(0); setActive(item)
    playNumber(item.number, true)
  }, [])

  const handleCountTogether = useCallback(() => {
    if (counting) {
      cancelRef.current?.(); cancelRef.current = null
      setCounting(false); setHighlighted([]); setCurrentNum(0)
      return
    }
    initAudio()
    setHighlighted([]); setCurrentNum(0); setCounting(true)

    const cancel = startCountSequence(
      active.number,
      (n: number) => {
        setHighlighted(prev => [...prev, n - 1])
        setCurrentNum(n)
      },
      () => { setCounting(false); cancelRef.current = null }
    )
    cancelRef.current = cancel
  }, [active, counting])

  const emojis = Array.from({ length: active.number }, () => active.emoji)

  return (
    <div>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'28px', justifyContent:'center' }}>
        {NUMBERS.map(item => (
          <button key={item.number} onClick={() => handleSelect(item)} style={{
            width:'52px', height:'52px', borderRadius:'14px',
            border:`3px solid ${active.number===item.number ? item.color : item.color+'44'}`,
            backgroundColor: active.number===item.number ? item.color : item.color+'18',
            fontWeight:900, fontSize:'1.4rem',
            color: active.number===item.number ? 'white' : item.color,
            cursor:'pointer', transition:'all 0.18s',
            boxShadow: active.number===item.number ? `0 4px 14px ${item.color}77` : 'none',
          }}>
            {item.number}
          </button>
        ))}
      </div>

      <div style={{ borderRadius:'28px', padding:'28px', backgroundColor:active.color+'13', border:`3px solid ${active.color}44`, marginBottom:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'22px', justifyContent:'center' }}>
          <span style={{ fontSize:'clamp(4.5rem,13vw,7rem)', fontWeight:900, color:active.color, lineHeight:1, textShadow:`0 5px 0 ${active.color}33` }}>
            {active.number}
          </span>
          <span style={{ fontSize:'clamp(1.6rem,5vw,2.4rem)', fontWeight:900, color:'#3D3D3D', letterSpacing:'4px' }}>
            {active.label}
          </span>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center', padding:'18px', borderRadius:'20px', backgroundColor:'white', border:`2px solid ${active.color}22`, marginBottom:'18px', minHeight:'80px', position:'relative' }}>
          {emojis.map((e, i) => (
            <span key={i} style={{
              fontSize: active.number<=5?'3rem':active.number<=8?'2.5rem':'2rem',
              transition:'transform 0.22s ease, filter 0.22s ease',
              transform: highlighted.includes(i) ? 'scale(1.4)' : 'scale(1)',
              filter: highlighted.length===0||highlighted.includes(i) ? 'none' : 'grayscale(1) opacity(0.2)',
              display:'inline-block',
            }}>
              {e}
            </span>
          ))}
          {counting && currentNum > 0 && (
            <div className="pop" style={{ position:'absolute', top:-14, right:-14, width:'42px', height:'42px', borderRadius:'50%', backgroundColor:active.color, color:'white', fontWeight:900, fontSize:'1.4rem', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 3px 10px ${active.color}88` }}>
              {currentNum}
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => { initAudio(); playNumber(active.number, true) }}
            style={{ padding:'10px 20px', borderRadius:'14px', fontWeight:700, fontSize:'14px', backgroundColor:'white', color:active.color, border:`2px solid ${active.color}`, cursor:'pointer' }}>
            🔊 Escuchar
          </button>
          <button onClick={handleCountTogether}
            style={{ padding:'10px 22px', borderRadius:'14px', fontWeight:700, fontSize:'14px', backgroundColor:counting?'#E8A87C':active.color, color:'white', border:'none', cursor:'pointer', boxShadow:`0 4px 0 ${counting?'#C47D47':active.color+'BB'}`, transition:'all 0.18s' }}>
            {counting ? '⏹ Parar' : '🤝 Contemos juntos'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function generateOptions(correct: number): number[] {
  const opts: number[] = [correct]
  const near = shuffle([correct-2,correct-1,correct+1,correct+2].filter(n=>n>=1&&n<=10))
  for (const n of near) { if (opts.length<4 && !opts.includes(n)) opts.push(n) }
  while (opts.length<4) {
    const r = Math.floor(Math.random()*10)+1
    if (!opts.includes(r)) opts.push(r)
  }
  return shuffle(opts)
}

function QuizTab() {
  const [itemIdx,  setItemIdx]  = useState(() => Math.floor(Math.random()*NUMBERS.length))
  const [options,  setOptions]  = useState(() => { const i=Math.floor(Math.random()*NUMBERS.length); return generateOptions(NUMBERS[i].number) })
  const [counted,  setCounted]  = useState<number[]>([])
  const [selected, setSelected] = useState<number|null>(null)
  const [isCorrect,setIsCorrect]= useState<boolean|null>(null)
  const [streak,   setStreak]   = useState(0)
  const [total,    setTotal]    = useState(0)
  const [showConf, setShowConf] = useState(false)
  const [animKey,  setAnimKey]  = useState(0)
  const item = NUMBERS[itemIdx]

  const nextRound = useCallback(() => {
    const next = Math.floor(Math.random()*NUMBERS.length)
    setItemIdx(next); setOptions(generateOptions(NUMBERS[next].number))
    setCounted([]); setSelected(null); setIsCorrect(null); setAnimKey(k=>k+1)
  }, [])

  const handleEmojiTap = useCallback((i: number) => {
    if (selected!==null||counted.includes(i)) return
    initAudio()
    const next = [...counted, i]
    setCounted(next)
    playCountBlip(next.length)
    playNumber(next.length, false)
  }, [counted, selected])

  const handleOption = useCallback((num: number) => {
    if (selected!==null) return
    initAudio(); setSelected(num)
    const correct = num===item.number
    setIsCorrect(correct); setTotal(t=>t+1)
    if (correct) {
      const ns=streak+1; setStreak(ns)
      if (ns%5===0) { playCelebrationVoice(); setShowConf(true); setTimeout(()=>setShowConf(false),3000) }
      else playCorrect()
      setTimeout(nextRound, 1300)
    } else {
      playTryAgain()
      setTimeout(()=>{setSelected(null);setIsCorrect(null)},950)
    }
  }, [selected, item, streak, nextRound])

  const emojis = Array.from({length:item.number},()=>item.emoji)

  return (
    <div>
      <Confetti active={showConf} />
      <div style={{display:'flex',gap:'10px',marginBottom:'24px'}}>
        {([['🔥','Racha',streak],['❓','Total',total],['🎯','%',total>0?`${Math.round(streak/total*100)}%`:'–']] as [string,string,string|number][]).map(([e,l,v])=>(
          <div key={l} style={{flex:1,background:'white',borderRadius:'16px',padding:'12px',textAlign:'center',border:'2px solid #EDE8DF'}}>
            <p style={{margin:'0 0 2px',fontSize:'18px'}}>{e}</p>
            <p style={{margin:'0 0 2px',fontSize:'22px',fontWeight:900,color:'#3D3D3D'}}>{v}</p>
            <p style={{margin:0,fontSize:'11px',color:'#6B6B6B',fontWeight:700}}>{l}</p>
          </div>
        ))}
      </div>
      <div key={animKey} className="slide-in">
        <p style={{textAlign:'center',fontSize:'17px',fontWeight:800,color:'#6B6B6B',marginBottom:'16px'}}>
          ¿Cuántos {item.emoji} hay?{' '}<span style={{color:'#3D3D3D',fontWeight:600}}>Toca cada uno</span>
        </p>
        <div style={{borderRadius:'24px',padding:'20px',backgroundColor:item.color+'14',border:`3px solid ${item.color}44`,marginBottom:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'6px',backgroundColor:item.color,color:'white',borderRadius:'20px',padding:'4px 16px',fontWeight:900,fontSize:'1.1rem'}}>
              {counted.length} <span style={{fontSize:'12px',fontWeight:600,opacity:0.85}}>contados</span>
            </div>
            {counted.length>0&&<button onClick={()=>setCounted([])} style={{fontSize:'12px',fontWeight:700,padding:'4px 12px',borderRadius:'12px',border:'none',cursor:'pointer',backgroundColor:item.color+'33',color:item.color}}>↺ Reset</button>}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',justifyContent:'center'}}>
            {emojis.map((e,i)=>(
              <button key={i} onClick={()=>handleEmojiTap(i)} style={{
                fontSize:item.number<=5?'2.8rem':item.number<=8?'2.2rem':'1.8rem',
                background:'none',border:'none',
                cursor:counted.includes(i)||selected!==null?'default':'pointer',
                transform:counted.includes(i)?'scale(1.28)':'scale(1)',
                filter:counted.includes(i)?'none':'grayscale(0.3) opacity(0.5)',
                transition:'all 0.18s',lineHeight:1,padding:'4px',
              }}>{e}</button>
            ))}
          </div>
        </div>
        <p style={{textAlign:'center',fontSize:'14px',fontWeight:700,color:'#6B6B6B',marginBottom:'10px'}}>Ahora elige el número:</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',maxWidth:'320px',margin:'0 auto'}}>
          {options.map(opt=>{
            let bg='white',border='#DDD5C8',col='#3D3D3D',shadow='0 4px 0 #C0B5A0'
            if(selected===opt){
              if(isCorrect){bg='#B8D4AC';border='#5E8A4E';col='#1A4A10';shadow='none'}
              else{bg='#F5C9A8';border='#C47D47';col='#7A2A00';shadow='none'}
            }
            return(
              <button key={opt} onClick={()=>handleOption(opt)}
                style={{padding:'18px 8px',borderRadius:'18px',border:`3px solid ${border}`,backgroundColor:bg,color:col,fontWeight:900,fontSize:'clamp(2rem,7vw,3rem)',boxShadow:shadow,cursor:'pointer',transition:'all 0.15s'}}
                className="active:scale-90">{opt}</button>
            )
          })}
        </div>
        {isCorrect&&(
          <div className="pop" style={{marginTop:'16px',textAlign:'center',padding:'16px',borderRadius:'20px',backgroundColor:'#EEF7EA',border:'2px solid #B8D4AC'}}>
            <p style={{margin:0,fontSize:'20px',fontWeight:900,color:'#1A4A10'}}>✅ ¡Correcto! Son <span style={{color:item.color}}>{item.label}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NumbersGame() {
  const [tab, setTab] = useState<Tab>('explore')
  return (
    <div style={{maxWidth:'680px',margin:'0 auto'}}>
      <div style={{display:'flex',gap:'8px',marginBottom:'28px',padding:'6px',borderRadius:'20px',backgroundColor:'#EEF7EA'}}>
        {(['explore','quiz'] as const).map(id=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'12px 8px',borderRadius:'14px',border:'none',cursor:'pointer',backgroundColor:tab===id?'#8BAF7C':'transparent',color:tab===id?'white':'#6B6B6B',fontWeight:tab===id?800:600,transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
            <span style={{fontSize:'15px'}}>{id==='explore'?'🔢 Explorar':'🎯 Quiz'}</span>
            <span style={{fontSize:'11px',opacity:0.8}}>{id==='explore'?'Aprende los números':'Cuenta y adivina'}</span>
          </button>
        ))}
      </div>
      {tab==='explore'&&<ExploreTab />}
      {tab==='quiz'&&<QuizTab />}
    </div>
  )
}

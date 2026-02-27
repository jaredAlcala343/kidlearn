'use client'

// ─── Web Audio API ────────────────────────────────────────────────────────────
let _ctx: AudioContext | null = null
function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function note(freq: number, start: number, dur: number, vol = 0.13, type: OscillatorType = 'sine') {
  const c = ctx(); if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain); gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  gain.gain.setValueAtTime(0, c.currentTime + start)
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur + 0.01)
}

// C major arpeggio — correct answer
export function playSparkleTone() {
  [[523,0,0.22],[659,0.1,0.22],[784,0.2,0.22],[1047,0.32,0.35]].forEach(([f,t,d]) => note(f,t,d,0.13))
}

// Soft sad drop — wrong
export function playWrongTone() {
  note(370, 0, 0.22, 0.11, 'triangle')
  note(311, 0.2, 0.32, 0.09, 'triangle')
}

// Count blip — pentatonic, rises with number
const PENTA = [261, 294, 330, 392, 440, 523, 587, 659, 784, 880]
export function playCountBlip(n: number) {
  const freq = PENTA[Math.min(n - 1, PENTA.length - 1)]
  note(freq, 0, 0.18, 0.14, 'sine')
  note(freq * 2, 0, 0.09, 0.04, 'sine') // soft overtone
}

// Big celebration fanfare
export function playCelebration() {
  const m = [[392,0],[440,0.1],[494,0.2],[523,0.31],[587,0.43],[659,0.56],[698,0.69],[784,0.83]]
  m.forEach(([f,t]) => note(f, t, 0.28, 0.14))
  ;[784, 988, 1175].forEach(f => note(f, 1.05, 0.65, 0.09))
}

// ─── Background music: gentle pentatonic lullaby loop ─────────────────────────
let bgGain: GainNode | null = null
let bgRunning = false
let bgStop = false
let bgLoopTimer: ReturnType<typeof setTimeout> | null = null

// Returns total duration of one melody loop in seconds
function scheduleMelody(c: AudioContext, dest: GainNode, startAt: number): number {
  // C pentatonic: C4 D4 E4 G4 A4 C5 D5 E5
  const pattern: [number, number][] = [
    [523,0.55],[392,0.35],[440,0.35],[523,0.45],[659,0.35],
    [523,0.35],[392,0.55],[330,0.35],[294,0.35],[261,0.65],

    [294,0.40],[330,0.35],[392,0.50],[440,0.35],[523,0.45],
    [659,0.35],[587,0.35],[523,0.75],

    [440,0.40],[523,0.35],[659,0.50],[523,0.35],[440,0.40],
    [392,0.35],[330,0.35],[294,0.65],

    [523,0.45],[440,0.35],[392,0.45],[330,0.35],[294,0.40],[261,0.90],
  ]
  let t = startAt
  for (const [freq, dur] of pattern) {
    // Melody note
    const osc = c.createOscillator()
    const g   = c.createGain()
    osc.connect(g); g.connect(dest)
    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.07, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.85)
    osc.start(t); osc.stop(t + dur)

    // Occasional warm bass
    if (Math.random() > 0.55) {
      const bass = c.createOscillator()
      const bg2  = c.createGain()
      bass.connect(bg2); bg2.connect(dest)
      bass.type = 'triangle'
      bass.frequency.value = freq / 2
      bg2.gain.setValueAtTime(0, t)
      bg2.gain.linearRampToValueAtTime(0.035, t + 0.05)
      bg2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7)
      bass.start(t); bass.stop(t + dur)
    }
    t += dur
  }
  return t - startAt
}

export function startBgMusic() {
  if (bgRunning) return
  const c = ctx(); if (!c) return
  bgRunning = true; bgStop = false

  bgGain = c.createGain()
  bgGain.gain.setValueAtTime(0, c.currentTime)
  bgGain.gain.linearRampToValueAtTime(0.9, c.currentTime + 3) // fade in over 3s
  bgGain.connect(c.destination)

  let loopStart = c.currentTime + 0.2

  const loop = () => {
    if (bgStop || !bgGain) { bgRunning = false; return }
    const dur = scheduleMelody(c, bgGain, loopStart)
    loopStart += dur
    const msUntilNext = (loopStart - c.currentTime - 0.3) * 1000
    bgLoopTimer = setTimeout(loop, Math.max(200, msUntilNext))
  }
  loop()
}

export function stopBgMusic() {
  bgStop = true
  if (bgLoopTimer) clearTimeout(bgLoopTimer)
  const c = ctx()
  if (c && bgGain) {
    bgGain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5)
    setTimeout(() => { bgRunning = false; bgGain = null }, 2000)
  } else {
    bgRunning = false; bgGain = null
  }
}

export function setBgVolume(v: number) {
  const c = ctx()
  if (c && bgGain) bgGain.gain.linearRampToValueAtTime(v * 0.9, c.currentTime + 0.4)
}

// ─── Speech Synthesis ─────────────────────────────────────────────────────────
let cachedVoice: SpeechSynthesisVoice | null = null
let voiceReady = false

function getBestVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  if (cachedVoice) return cachedVoice

  // Best voices ranked by naturalness (Google Neural > macOS neural > any es)
  const tests = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang === 'es-US',
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang === 'es-MX',
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('es'),
    (v: SpeechSynthesisVoice) => /paulina|ximena|mónica|jorge|carlos|diego/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'es-US',
    (v: SpeechSynthesisVoice) => v.lang === 'es-MX',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('es'),
  ]
  for (const test of tests) {
    const found = voices.find(test)
    if (found) { cachedVoice = found; return found }
  }
  return null
}

function makeUtterance(text: string, rate: number, pitch: number): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-US'
  u.rate = rate
  u.pitch = pitch
  u.volume = 1
  const v = getBestVoice()
  if (v) u.voice = v
  return u
}

// ─── Simple serial speech queue using onend chaining ─────────────────────────
// Each item: text + audio params. They fire one after the other.
interface SpeechItem { text: string; rate: number; pitch: number }
let queue: SpeechItem[] = []
let speaking = false

function processNext() {
  if (speaking || queue.length === 0) return
  if (!('speechSynthesis' in window)) return
  speaking = true
  const item = queue.shift()!
  const u = makeUtterance(item.text, item.rate, item.pitch)
  u.onend   = () => { speaking = false; processNext() }
  u.onerror = () => { speaking = false; processNext() }
  window.speechSynthesis.speak(u)
}

function enqueue(text: string, rate: number, pitch: number) {
  queue.push({ text, rate, pitch })
  if (!voiceReady) {
    if (window.speechSynthesis.getVoices().length > 0) {
      voiceReady = true; processNext()
    } else {
      window.speechSynthesis.onvoiceschanged = () => { voiceReady = true; cachedVoice = null; processNext() }
    }
  } else {
    processNext()
  }
}

function cancelAll() {
  window.speechSynthesis.cancel()
  queue = []
  speaking = false
}

// Public: interrupt=true cancels everything before speaking
export function speak(text: string, rate = 0.82, pitch = 1.1, interrupt = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  if (interrupt) cancelAll()
  enqueue(text, rate, pitch)
}

export function speakLetterWord(letter: string, word: string) {
  cancelAll()
  enqueue(letter, 0.65, 1.22)
  enqueue(`de ${word}`, 0.80, 1.1)
}

export function speakWord(word: string) {
  speak(word, 0.76, 1.1, true)
}

export function speakCelebration() {
  playCelebration()
  const msgs = ['¡Muy bien!','¡Excelente!','¡Bravo!','¡Lo lograste!','¡Fantástico!','¡Genial!','¡Súper!']
  setTimeout(() => speak(msgs[Math.floor(Math.random() * msgs.length)], 0.88, 1.15, true), 380)
}

export function speakTryAgain() {
  playWrongTone()
  setTimeout(() => speak('¡Inténtalo de nuevo!', 0.82, 1.1, true), 200)
}

// ─── COUNT SEQUENCE: one-by-one using onend chaining ─────────────────────────
// Returns a cancel function
export function speakCountSequence(
  upTo: number,
  onStep: (n: number) => void,    // called just before each number is spoken
  onDone: () => void              // called after final label
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {}

  // Make sure AudioContext is alive
  ctx()?.resume()

  let cancelled = false
  cancelAll()

  const labels: Record<number,string> = {
    1:'¡uno!',2:'¡dos!',3:'¡tres!',4:'¡cuatro!',5:'¡cinco!',
    6:'¡seis!',7:'¡siete!',8:'¡ocho!',9:'¡nueve!',10:'¡diez!'
  }

  // Chain: speak "1" → onend → speak "2" → onend → ... → final label → onDone
  function speakStep(n: number) {
    if (cancelled) return
    if (n > upTo) {
      // All numbers done — say the label
      const u = makeUtterance(labels[upTo] ?? String(upTo), 0.80, 1.2)
      u.onend = () => { if (!cancelled) onDone() }
      u.onerror = () => { if (!cancelled) onDone() }
      window.speechSynthesis.speak(u)
      return
    }

    // Trigger visual + blip BEFORE speaking the number
    onStep(n)
    playCountBlip(n)

    const u = makeUtterance(String(n), 0.72, 1.2)
    u.onend   = () => { if (!cancelled) setTimeout(() => speakStep(n + 1), 120) }
    u.onerror = () => { if (!cancelled) setTimeout(() => speakStep(n + 1), 120) }
    window.speechSynthesis.speak(u)
  }

  // Small delay so button press animation finishes
  setTimeout(() => { if (!cancelled) speakStep(1) }, 150)

  return () => {
    cancelled = true
    window.speechSynthesis.cancel()
  }
}

export function initAudio() {
  ctx() // unlock AudioContext on first user gesture
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) voiceReady = true
  }
}

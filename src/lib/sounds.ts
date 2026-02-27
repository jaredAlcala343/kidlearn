'use client'

/**
 * sounds.ts — Audio system for KidLearn
 *
 * PRIORITY ORDER:
 *  1. Pre-generated ElevenLabs MP3s in /public/audio/  ← best quality
 *  2. Web Speech API (browser built-in)                ← fallback
 *  3. Web Audio tones (always available)               ← effects & music
 */

// ─── MP3 CACHE ────────────────────────────────────────────────────────────────
// Preload an AudioBuffer from an MP3 file for zero-latency playback
const mp3Cache = new Map<string, AudioBuffer | null>()
let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {})
  return _ctx
}

async function loadMP3(name: string): Promise<AudioBuffer | null> {
  if (mp3Cache.has(name)) return mp3Cache.get(name)!
  const c = getCtx(); if (!c) return null
  try {
    const res = await fetch(`/audio/${name}.mp3`)
    if (!res.ok) { mp3Cache.set(name, null); return null }
    const buf = await res.arrayBuffer()
    const decoded = await c.decodeAudioData(buf)
    mp3Cache.set(name, decoded)
    return decoded
  } catch {
    mp3Cache.set(name, null)
    return null
  }
}

// Play a pre-generated MP3 clip. Returns true if played, false if not found.
async function playMP3(name: string, volume = 1): Promise<boolean> {
  const buf = await loadMP3(name)
  if (!buf) return false
  const c = getCtx(); if (!c) return false
  const src  = c.createBufferSource()
  const gain = c.createGain()
  src.buffer = buf
  gain.gain.value = volume
  src.connect(gain)
  gain.connect(c.destination)
  src.start()
  return true
}

// Pre-load a set of clips in the background (call on app init)
export function preloadAudio(names: string[]) {
  for (const name of names) loadMP3(name)
}

// ─── WEB AUDIO TONES (effects + background music) ─────────────────────────────
function note(freq: number, start: number, dur: number, vol = 0.13, type: OscillatorType = 'sine') {
  const c = getCtx(); if (!c) return
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

export function playSparkleTone() {
  [[523,0,0.22],[659,0.10,0.22],[784,0.20,0.22],[1047,0.32,0.38]]
    .forEach(([f,t,d]) => note(f, t, d, 0.13))
}

export function playWrongTone() {
  note(370, 0, 0.22, 0.11, 'triangle')
  note(311, 0.21, 0.32, 0.09, 'triangle')
}

const PENTA = [261, 294, 330, 392, 440, 523, 587, 659, 784, 880]
export function playCountBlip(n: number) {
  const f = PENTA[Math.min(n - 1, PENTA.length - 1)]
  note(f, 0, 0.18, 0.14)
  note(f * 2, 0, 0.09, 0.04)
}

export function playCelebration() {
  [[392,0],[440,0.1],[494,0.2],[523,0.31],[587,0.43],[659,0.56],[698,0.69],[784,0.83]]
    .forEach(([f,t]) => note(f, t, 0.28, 0.14))
  ;[784, 988, 1175].forEach(f => note(f, 1.05, 0.65, 0.09))
}

// ─── BACKGROUND MUSIC ─────────────────────────────────────────────────────────
let bgGain: GainNode | null = null
let bgRunning = false
let bgStop = false
let bgLoopTimer: ReturnType<typeof setTimeout> | null = null

function scheduleMelody(c: AudioContext, dest: GainNode, t0: number): number {
  const pat: [number, number][] = [
    [523,.55],[392,.35],[440,.35],[523,.45],[659,.35],
    [523,.35],[392,.55],[330,.35],[294,.35],[261,.65],
    [294,.40],[330,.35],[392,.50],[440,.35],[523,.45],
    [659,.35],[587,.35],[523,.75],
    [440,.40],[523,.35],[659,.50],[523,.35],[440,.40],
    [392,.35],[330,.35],[294,.65],
    [523,.45],[440,.35],[392,.45],[330,.35],[294,.40],[261,.90],
  ]
  let t = t0
  for (const [freq, dur] of pat) {
    const osc = c.createOscillator(); const g = c.createGain()
    osc.connect(g); g.connect(dest); osc.type = 'sine'; osc.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.065, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.85)
    osc.start(t); osc.stop(t + dur)
    if (Math.random() > 0.55) {
      const b = c.createOscillator(); const bg2 = c.createGain()
      b.connect(bg2); bg2.connect(dest); b.type = 'triangle'; b.frequency.value = freq / 2
      bg2.gain.setValueAtTime(0, t)
      bg2.gain.linearRampToValueAtTime(0.032, t + 0.05)
      bg2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7)
      b.start(t); b.stop(t + dur)
    }
    t += dur
  }
  return t - t0
}

export function startBgMusic() {
  if (bgRunning) return
  const c = getCtx(); if (!c) return
  bgRunning = true; bgStop = false
  bgGain = c.createGain()
  bgGain.gain.setValueAtTime(0, c.currentTime)
  bgGain.gain.linearRampToValueAtTime(0.85, c.currentTime + 3)
  bgGain.connect(c.destination)
  let ls = c.currentTime + 0.2
  const loop = () => {
    if (bgStop || !bgGain) { bgRunning = false; return }
    ls += scheduleMelody(c, bgGain, ls)
    bgLoopTimer = setTimeout(loop, Math.max(200, (ls - c.currentTime - 0.3) * 1000))
  }
  loop()
}

export function stopBgMusic() {
  bgStop = true
  if (bgLoopTimer) clearTimeout(bgLoopTimer)
  const c = getCtx()
  if (c && bgGain) {
    bgGain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5)
    setTimeout(() => { bgRunning = false; bgGain = null }, 2000)
  } else { bgRunning = false; bgGain = null }
}

export function setBgVolume(v: number) {
  const c = getCtx()
  if (c && bgGain) bgGain.gain.linearRampToValueAtTime(v * 0.85, c.currentTime + 0.4)
}

// ─── WEB SPEECH FALLBACK ──────────────────────────────────────────────────────
let cachedVoice: SpeechSynthesisVoice | null = null
let voiceReady = false

function getBestVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  if (cachedVoice) return cachedVoice
  const tests = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang === 'es-US',
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang === 'es-MX',
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('es'),
    (v: SpeechSynthesisVoice) => /paulina|ximena|mónica|jorge|carlos|diego/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'es-US',
    (v: SpeechSynthesisVoice) => v.lang === 'es-MX',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('es'),
  ]
  for (const t of tests) { const f = voices.find(t); if (f) { cachedVoice = f; return f } }
  return null
}

function speakFallback(text: string, rate: number, pitch: number): Promise<void> {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve(); return }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-US'; u.rate = rate; u.pitch = pitch; u.volume = 1
    const v = getBestVoice(); if (v) u.voice = v
    const ensureLoad = () => { cachedVoice = null; window.speechSynthesis.speak(u) }
    u.onend = () => resolve(); u.onerror = () => resolve()
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = ensureLoad
    } else { window.speechSynthesis.speak(u) }
  })
}

// ─── HIGH-LEVEL SPEAK API ─────────────────────────────────────────────────────
// Tries MP3 first; if unavailable, falls back to Web Speech.

export async function playLetter(letter: string) {
  const key = `letter-${letter}`
  if (await playMP3(key)) return
  // Fallback: speak the letter name
  const names: Record<string,string> = {
    A:'a',B:'be',C:'ce',D:'de',E:'e',F:'efe',G:'ge',H:'hache',
    I:'i',J:'jota',L:'ele',M:'eme',N:'ene',O:'o',P:'pe',
    R:'erre',S:'ese',T:'te',U:'u',V:'ve'
  }
  await speakFallback(names[letter] ?? letter, 0.70, 1.2)
}

export async function playWord(word: string) {
  // Normalize: strip accents for filename lookup, keep original for speech
  const key = `word-${word.replace(/\s/g,'')}`
  if (await playMP3(key)) return
  await speakFallback(word.toLowerCase(), 0.76, 1.1)
}

export async function playLetterWord(letter: string, word: string) {
  await playLetter(letter)
  // Small gap between letter and word
  await new Promise(r => setTimeout(r, 80))
  const deKey = `de-${word}`
  if (await playMP3(deKey)) return
  await speakFallback(`de ${word.toLowerCase()}`, 0.80, 1.1)
}

export async function playNumber(n: number, withLabel = true) {
  if (withLabel) {
    if (await playMP3(`num-${n}`)) return
    const labels: Record<number,string> = {1:'uno',2:'dos',3:'tres',4:'cuatro',5:'cinco',6:'seis',7:'siete',8:'ocho',9:'nueve',10:'diez'}
    await speakFallback(labels[n] ?? String(n), 0.76, 1.1)
  } else {
    if (await playMP3(`count-${n}`)) return
    await speakFallback(String(n), 0.72, 1.2)
  }
}

export async function playPhrase(key: string, fallbackText: string, rate = 0.84, pitch = 1.12) {
  if (await playMP3(key)) return
  await speakFallback(fallbackText, rate, pitch)
}

export async function playCelebrationVoice() {
  playCelebration()    // always play musical fanfare
  await new Promise(r => setTimeout(r, 380))
  const n = Math.floor(Math.random() * 7) + 1
  const texts = ['¡Muy bien!','¡Excelente!','¡Bravo!','¡Lo lograste!','¡Fantástico!','¡Genial!','¡Súper!']
  await playPhrase(`celebrate-${n}`, texts[n - 1], 0.88, 1.15)
}

export async function playTryAgain() {
  playWrongTone()
  await new Promise(r => setTimeout(r, 200))
  await playPhrase('try-again', '¡Inténtalo de nuevo!', 0.82, 1.1)
}

export async function playCorrect() {
  playSparkleTone()
  await new Promise(r => setTimeout(r, 200))
  const ok = ['¡Muy bien!','¡Correcto!','¡Bravo!','¡Sí!','¡Genial!','¡Súper!']
  const n = Math.floor(Math.random() * 7) + 1
  await playPhrase(`celebrate-${n}`, ok[Math.floor(Math.random() * ok.length)], 0.88, 1.15)
}

// ─── COUNT SEQUENCE (letter-by-letter, waits for each to finish) ──────────────
export function startCountSequence(
  upTo: number,
  onStep: (n: number) => void,
  onDone: () => void
): () => void {
  let cancelled = false

  async function step(n: number) {
    if (cancelled) return
    if (n > upTo) {
      if (!cancelled) {
        // Play the number name after all counts
        await playNumber(upTo, true)
        if (!cancelled) onDone()
      }
      return
    }
    onStep(n)
    playCountBlip(n)
    await playNumber(n, false)     // plays "1", "2", etc. (short)
    await new Promise(r => setTimeout(r, 100))  // tiny breath between numbers
    if (!cancelled) step(n + 1)
  }

  setTimeout(() => { if (!cancelled) step(1) }, 150)

  return () => { cancelled = true }
}

// ─── INIT ──────────────────────────────────────────────────────────────────────
export function initAudio() {
  getCtx()
  if ('speechSynthesis' in window) {
    const v = window.speechSynthesis.getVoices()
    if (v.length > 0) voiceReady = true
    else window.speechSynthesis.onvoiceschanged = () => { voiceReady = true; cachedVoice = null }
  }
}

// Preload the most frequently used clips immediately
export function preloadCriticalAudio() {
  const critical = [
    'celebrate-1','celebrate-2','celebrate-3','celebrate-4','celebrate-5','celebrate-6','celebrate-7',
    'try-again','correct',
    'count-1','count-2','count-3','count-4','count-5','count-6','count-7','count-8','count-9','count-10',
    'num-1','num-2','num-3','num-4','num-5',
  ]
  preloadAudio(critical)
}

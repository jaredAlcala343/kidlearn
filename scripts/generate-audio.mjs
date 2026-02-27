/**
 * KidLearn — ElevenLabs Audio Generator
 * ──────────────────────────────────────
 * Generates all voice clips needed for the app and saves them to
 * public/audio/ as MP3 files.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=your_key node scripts/generate-audio.mjs
 *
 * Or create a .env.local file with ELEVENLABS_API_KEY=...
 * then run: node -r dotenv/config scripts/generate-audio.mjs
 *
 * Free tier: 10,000 chars/month — this script uses ~852 chars total.
 *
 * Recommended voice IDs (Spanish, child-friendly, natural):
 *   - "Matilda"   : XrExE9yKIg1WjnnlVkGX  (warm, friendly female)
 *   - "Rachel"    : 21m00Tcm4TlvDq8ikWAM  (clear, natural female)
 *   - "Antoni"    : ErXwobaYiN019PkySvjV  (warm male)
 *   - "Grace"     : oWAxZDx7w5VEj9dCyTzz  (soft female)
 *   - "Lily"      : pFZP5JQG7iQjIQuC4Bku  (gentle female, great for kids)
 *
 * Browse all voices at: https://elevenlabs.io/voice-library
 * Filter by "Spanish" language for native Spanish voices.
 */

import fs   from 'fs'
import path from 'path'

// ── CONFIG ────────────────────────────────────────────────────────────────────
const API_KEY = process.env.ELEVENLABS_API_KEY
if (!API_KEY) {
  console.error('❌  Missing ELEVENLABS_API_KEY environment variable')
  console.error('   Run: ELEVENLABS_API_KEY=sk_... node scripts/generate-audio.mjs')
  process.exit(1)
}

// Change this to any voice ID from elevenlabs.io/voice-library
// "Lily" sounds very warm and natural for children's apps
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pFZP5JQG7iQjIQuC4Bku'

const VOICE_SETTINGS = {
  stability:         0.55,   // 0-1: higher = more consistent, lower = more expressive
  similarity_boost:  0.75,   // 0-1: how closely to match the original voice
  style:             0.35,   // 0-1: speaking style exaggeration (0 = neutral)
  use_speaker_boost: true,
}

const OUT_DIR = path.join(process.cwd(), 'public', 'audio')
fs.mkdirSync(OUT_DIR, { recursive: true })

// ── ALL AUDIO CLIPS ───────────────────────────────────────────────────────────
// Format: { filename: 'text to speak' }
// Filename (without .mp3) becomes the key used in sounds.ts

const clips = {
  // ── Letters (spoken as letter names) ──────────────────────────────────────
  'letter-A': 'a',   'letter-B': 'be',  'letter-C': 'ce',
  'letter-D': 'de',  'letter-E': 'e',   'letter-F': 'efe',
  'letter-G': 'ge',  'letter-H': 'hache','letter-I': 'i',
  'letter-J': 'jota','letter-L': 'ele', 'letter-M': 'eme',
  'letter-N': 'ene', 'letter-O': 'o',   'letter-P': 'pe',
  'letter-R': 'erre','letter-S': 'ese',  'letter-T': 'te',
  'letter-U': 'u',   'letter-V': 've',

  // ── "de X" phrases ─────────────────────────────────────────────────────────
  'de-AVIÓN':    'de avión',    'de-BUS':       'de bus',
  'de-CASA':     'de casa',     'de-DELFÍN':    'de delfín',
  'de-ESTRELLA': 'de estrella', 'de-FLOR':      'de flor',
  'de-GATO':     'de gato',     'de-HELADO':    'de helado',
  'de-IRIS':     'de iris',     'de-JIRAFA':    'de jirafa',
  'de-LUNA':     'de luna',     'de-MANZANA':   'de manzana',
  'de-NUBE':     'de nube',     'de-OSO':       'de oso',
  'de-PÁJARO':   'de pájaro',   'de-RANA':      'de rana',
  'de-SOL':      'de sol',      'de-TORTUGA':   'de tortuga',
  'de-UVA':      'de uva',      'de-VACA':      'de vaca',

  // ── Words (all words from all letters + words game) ────────────────────────
  'word-AVIÓN':      'avión',      'word-ARAÑA':      'araña',
  'word-ÁRBOL':      'árbol',      'word-APPLE':      'apple',
  'word-BUS':        'bus',        'word-BALÓN':      'balón',
  'word-BALLENA':    'ballena',    'word-BANANA':     'banana',
  'word-CASA':       'casa',       'word-CONEJO':     'conejo',
  'word-CARRO':      'carro',      'word-CHOCOLATE':  'chocolate',
  'word-DELFÍN':     'delfín',     'word-DIENTE':     'diente',
  'word-DADO':       'dado',       'word-DINOSAURIO': 'dinosaurio',
  'word-ESTRELLA':   'estrella',   'word-ELEFANTE':   'elefante',
  'word-ESCALERA':   'escalera',   'word-ESCUELA':    'escuela',
  'word-FLOR':       'flor',       'word-FRESA':      'fresa',
  'word-FLAMINGO':   'flamenco',   'word-FOCA':       'foca',
  'word-GATO':       'gato',       'word-GIRASOL':    'girasol',
  'word-GORILA':     'gorila',     'word-GALLETA':    'galleta',
  'word-HELADO':     'helado',     'word-HOJA':       'hoja',
  'word-HADA':       'hada',       'word-HIPOPÓTAMO': 'hipopótamo',
  'word-IRIS':       'iris',       'word-ISLA':       'isla',
  'word-IGUANA':     'iguana',     'word-IGLÚ':       'iglú',
  'word-JIRAFA':     'jirafa',     'word-JAZMÍN':     'jazmín',
  'word-JUEGO':      'juego',      'word-JUGUETE':    'juguete',
  'word-LUNA':       'luna',       'word-LEÓN':       'león',
  'word-LAGARTO':    'lagarto',    'word-LÁMPARA':    'lámpara',
  'word-MANZANA':    'manzana',    'word-MARIPOSA':   'mariposa',
  'word-MAR':        'mar',        'word-MONO':       'mono',
  'word-NUBE':       'nube',       'word-NAVIDAD':    'navidad',
  'word-NARIZ':      'nariz',      'word-NARANJA':    'naranja',
  'word-OSO':        'oso',        'word-OJO':        'ojo',
  'word-OVEJA':      'oveja',      'word-OLA':        'ola',
  'word-PÁJARO':     'pájaro',     'word-PEZ':        'pez',
  'word-PANDA':      'panda',      'word-PAPOSA':     'paposa',
  'word-RANA':       'rana',       'word-ROSA':       'rosa',
  'word-RATÓN':      'ratón',      'word-RAPOSA':     'raposa',
  'word-SOL':        'sol',        'word-SERPIENTE':  'serpiente',
  'word-SETA':       'seta',       'word-SABANA':     'sabana',
  'word-TORTUGA':    'tortuga',    'word-TIGRE':      'tigre',
  'word-TELESCOPIO': 'telescopio', 'word-TARÁNTULA':  'tarántula',
  'word-UVA':        'uva',        'word-UNICORNIO':  'unicornio',
  'word-URSO':       'urso',       'word-UMBRELA':    'umbrela',
  'word-VACA':       'vaca',       'word-VIENTO':     'viento',
  'word-LUZ':        'luz',        'word-PIE':        'pie',
  'word-AVE':        'ave',        'word-RÍO':        'río',
  'word-MES':        'mes',        'word-GEL':        'gel',

  // ── Numbers (digit + spoken name) ─────────────────────────────────────────
  'num-1': 'uno',    'num-2': 'dos',    'num-3': 'tres',
  'num-4': 'cuatro', 'num-5': 'cinco',  'num-6': 'seis',
  'num-7': 'siete',  'num-8': 'ocho',   'num-9': 'nueve',
  'num-10': 'diez',

  // ── Counting (short individual numbers for count-together) ────────────────
  'count-1': '1', 'count-2': '2', 'count-3': '3',
  'count-4': '4', 'count-5': '5', 'count-6': '6',
  'count-7': '7', 'count-8': '8', 'count-9': '9',
  'count-10': '10',

  // ── Celebration & feedback ────────────────────────────────────────────────
  'celebrate-1':       '¡Muy bien!',
  'celebrate-2':       '¡Excelente!',
  'celebrate-3':       '¡Bravo!',
  'celebrate-4':       '¡Lo lograste!',
  'celebrate-5':       '¡Fantástico!',
  'celebrate-6':       '¡Genial!',
  'celebrate-7':       '¡Súper!',
  'celebrate-streak':  '¡Cinco en raya! ¡Eres increíble!',
  'try-again':         '¡Inténtalo de nuevo!',
  'correct':           '¡Correcto!',

  // ── Navigation ────────────────────────────────────────────────────────────
  'nav-letters': 'Vamos a aprender letras',
  'nav-numbers': 'Vamos a aprender números',
  'nav-words':   'Vamos a aprender palabras',
  'nav-menu':    'Menú principal',
}

// ── API CALL ──────────────────────────────────────────────────────────────────
async function generateClip(filename, text) {
  const outPath = path.join(OUT_DIR, `${filename}.mp3`)

  // Skip if already generated
  if (fs.existsSync(outPath)) {
    console.log(`  ⏭  ${filename}.mp3 (already exists)`)
    return
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',   // best multilingual model
      voice_settings: VOICE_SETTINGS,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`  ❌ ${filename}: HTTP ${res.status} — ${err}`)
    return
  }

  const buffer = await res.arrayBuffer()
  fs.writeFileSync(outPath, Buffer.from(buffer))
  console.log(`  ✅ ${filename}.mp3  (${text})`)
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const entries = Object.entries(clips)
  console.log(`\n🎙  Generating ${entries.length} audio clips with ElevenLabs`)
  console.log(`    Voice: ${VOICE_ID}`)
  console.log(`    Output: public/audio/\n`)

  // Generate sequentially to avoid rate limits (free tier: 2 req/s)
  let ok = 0, skip = 0, fail = 0
  for (const [filename, text] of entries) {
    const outPath = path.join(OUT_DIR, `${filename}.mp3`)
    if (fs.existsSync(outPath)) { skip++; console.log(`  ⏭  ${filename}.mp3`); continue }

    try {
      await generateClip(filename, text)
      ok++
      await new Promise(r => setTimeout(r, 550)) // ~1.8 req/s — safely under free tier limit
    } catch (e) {
      console.error(`  ❌ ${filename}: ${e.message}`)
      fail++
    }
  }

  console.log(`\n📊 Done: ${ok} generated, ${skip} skipped, ${fail} failed`)
  console.log(`📁 Files saved to: ${OUT_DIR}`)

  if (ok > 0 || skip > 0) {
    console.log(`\n✨ Next step: the app will automatically use these MP3 files.`)
    console.log(`   Run "npm run dev" to test.\n`)
  }
}

main().catch(console.error)

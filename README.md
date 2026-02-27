# KidLearn 🦉 — Aprendo Jugando

PWA educativa para niños menores de 5 años. Diseñada con colores suaves y tipografía amigable para enseñar letras, números y palabras de forma lúdica.

## Características

- 🔤 **Letras** — Toca la letra, escucha su sonido y ve la palabra que empieza con ella
- 🔢 **Números** — Cuenta los emojis y elige el número correcto
- 📝 **Palabras** — Arma palabras sencillas en español colocando las letras en orden
- 🔊 **Voz** — Usa Web Speech API para pronunciar letras, palabras y felicitaciones
- ⭐ **Estrellas** — Sistema de recompensas suave, sin sobreestimulación
- 🎉 **Confetti** — Celebración visual con emojis al acumular estrellas
- 📱 **PWA** — Instalable en móvil, funciona offline

## Paleta de colores (suave, no estridente)

| Color | Uso |
|-------|-----|
| `#FAF7F0` Crema | Fondo principal |
| `#7EB8D4` Azul cielo | Sección letras |
| `#8BAF7C` Salvia | Sección números |
| `#E8A87C` Melocotón | Sección palabras |
| `#3D3D3D` Carbón | Texto principal |

## Setup

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build producción (genera SW de PWA)
npm run build
npm start
```

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx       # Layout con meta PWA y fuente Nunito
│   ├── page.tsx         # Orquestador principal
│   └── globals.css      # Estilos base y animaciones
├── components/
│   ├── Menu.tsx         # Pantalla principal de selección
│   ├── LettersGame.tsx  # Juego de letras
│   ├── NumbersGame.tsx  # Juego de números
│   ├── WordsGame.tsx    # Juego de palabras
│   ├── Confetti.tsx     # Celebración de confetti con emojis
│   └── Stars.tsx        # Barra de progreso con estrellas
├── lib/
│   ├── gameData.ts      # Datos: letras, números, palabras
│   └── sounds.ts        # Web Speech API utilities
public/
├── manifest.json        # Manifiesto PWA
└── (icon-192.png, icon-512.png — agregar manualmente)
```

## Agregar iconos PWA

Coloca dos imágenes en `/public/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Puedes usar cualquier emoji 🦉 o diseño simple con fondo `#8BAF7C`.

## Personalización

- Agrega más palabras en `src/lib/gameData.ts` → `WORDS_ES`
- Agrega más letras en `LETTERS`
- Cambia voces en `src/lib/sounds.ts`

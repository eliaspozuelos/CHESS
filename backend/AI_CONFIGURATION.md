# 🤖 Configuración de IAs Avanzadas (OpenAI & Anthropic)

Esta guía te muestra cómo integrar modelos de IA avanzados como GPT-4 y Claude 3 en tu aplicación de ajedrez.

---

## 🎯 Modelos Disponibles

### **Stockfish (Local - Gratis)** ⚡
- **Modelo:** Motor de ajedrez tradicional
- **Configuración:** No requiere API key
- **Costo:** Gratis
- **Velocidad:** Rápido
- **Niveles:** Beginner, Intermediate, Advanced, Master

### **OpenAI (GPT-4 / GPT-3.5)** 🧠
- **Modelos:** 
  - `gpt-4` - Más inteligente y fuerte
  - `gpt-3.5-turbo` - Más rápido y económico
- **Configuración:** Requiere API key de OpenAI
- **Costo:** De pago (por uso)
- **Velocidad:** 2-5 segundos por movimiento

### **Google Gemini** 🤖
- **Modelos:**
  - `gemini-pro` - Gemini 1.5 Pro (Más potente)
  - `gemini-1.5-flash` - Gemini 1.5 Flash (Más rápido)
- **Configuración:** Requiere API key de Google AI Studio
- **Costo:** Gratis hasta cierto límite, luego de pago
- **Velocidad:** 2-4 segundos por movimiento

---

## 🔑 Cómo Obtener las API Keys

### **1. OpenAI API Key**

1. Ve a [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crea una cuenta o inicia sesión
3. Click en **"Create new secret key"**
4. Copia la clave (empieza con `sk-...`)
5. **IMPORTANTE:** Guárdala en un lugar seguro, no podrás verla de nuevo

**Costos estimados:**
- GPT-4: ~$0.03 USD por partida
- GPT-3.5 Turbo: ~$0.002 USD por partida

### **2. Google Gemini API Key**

1. Ve a [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Click en **"Create API Key"**
4. Selecciona un proyecto o crea uno nuevo
5. Copia la clave (empieza con `AIza...`)
6. **IMPORTANTE:** Guárdala en un lugar seguro

**Costos estimados:**
- **Gratis:** Hasta 15 solicitudes por minuto (RPM) y 1 millón de tokens/día
- **De pago:** Si superas el límite gratuito
- Gemini 1.5 Pro: ~$0.01 USD por partida (estimado)
- Gemini 1.5 Flash: ~$0.001 USD por partida (estimado)

---

## ⚙️ Configuración en el Backend

### **Paso 1: Agregar las API Keys al `.env`**

Edita `backend/.env` y agrega tus claves:

```env
# AI Providers API Keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxx
```

### **Paso 2: Reiniciar el Backend**

```bash
cd backend
pnpm dev
```

Verás en la consola:
```
✅ OpenAI API configured
✅ Gemini API configured
```

O si no configuraste las claves:
```
⚠️  OpenAI API key not configured
⚠️  Gemini API key not configured
🎲 Only Stockfish will be available
```

---

## 🎮 Cómo Usar en el Frontend

### **Seleccionar Modelo de IA**

En el componente `PlayerSelector`, ahora puedes elegir:

```tsx
// Configuración del jugador
{
  type: "ai",
  aiModel: "gpt-4",           // o "gpt-3.5-turbo", "gemini-pro", "gemini-1.5-flash", "stockfish"
  aiLevel: "intermediate"     // "beginner", "intermediate", "advanced", "master"
}
```

### **Ejemplo de Configuración de Partida**

```tsx
const config = {
  whitePlayer: {
    type: "ai",
    aiModel: "gpt-4",
    aiLevel: "master"
  },
  blackPlayer: {
    type: "ai",
    aiModel: "gemini-pro",
    aiLevel: "master"
  },
  gameType: "rapid"
}
```

---

## 🚀 Auto-inicio de Partidas IA vs IA

### **Nueva Funcionalidad**

Cuando ambos jugadores son IA (Blanco y Negro), la partida **inicia automáticamente**:

1. Click en **"Iniciar Partida"**
2. El servidor detecta que ambos son IA
3. ⚡ **La primera IA hace su movimiento automáticamente**
4. La segunda IA responde
5. ♾️ El juego continúa hasta terminar

**Ejemplo de configuración:**

```tsx
const config = {
  whitePlayer: { type: "ai", aiModel: "gpt-4", aiLevel: "advanced" },
  blackPlayer: { type: "ai", aiModel: "stockfish", aiLevel: "master" },
  gameType: "blitz"
}
```

Al hacer click en **"Iniciar Partida"**, verás:
- ✅ Partida creada
- ⚡ Blanco (GPT-4) hace su movimiento automáticamente
- ⚡ Negro (Stockfish) responde
- 🔄 La partida continúa sola

---

## 📊 Verificar Modelos Disponibles

### **Desde el Frontend**

Puedes consultar qué modelos están configurados:

```typescript
const response = await fetch('http://localhost:4000/api/games/ai-models')
const data = await response.json()

console.log(data.models)
// [
//   { model: 'stockfish', name: 'Stockfish (Local)', configured: true },
//   { model: 'gpt-4', name: 'GPT-4 (OpenAI)', configured: true },
//   { model: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)', configured: true },
//   { model: 'gemini-pro', name: 'Gemini 1.5 Pro (Google)', configured: true },
//   { model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Google)', configured: true }
// ]
```

---

## 🔧 Funcionamiento Interno

### **Flujo de Decisión**

1. **Usuario configura la partida** con modelo de IA específico
2. **Backend recibe el turno de la IA:**
   ```
   ┌─ Modelo configurado: GPT-4?
   │  ├─ Sí → Llamar a OpenAI API
   │  │       ├─ Éxito → Usar movimiento de GPT-4
   │  │       └─ Error → Fallback a Stockfish
   │  └─ No → Usar Stockfish directamente
   ```
3. **Respuesta al frontend** con el movimiento

### **Prompts a las IAs**

Cuando se usa GPT/Claude, se envía este prompt:

```
Current position (FEN): rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

Skill level: master
Instructions: Play at a master level. Use deep calculation, strategic mastery, and optimal play.

Previous moves: e2e4 e7e5 g1f3

Legal moves available: a2a3, a2a4, b2b3, b2b4, c2c3, c2c4, d2d3, d2d4, ...

Choose the best move and respond ONLY with the move in UCI format (e.g., "e2e4").
```

---

## ⚠️ Consideraciones

### **Costos**

- **Stockfish:** Gratis ✅
- **Gemini 1.5 Flash:** Gratis (con límites) ✅ / ~$0.001 después 💵
- **Gemini 1.5 Pro:** Gratis (con límites) ✅ / ~$0.01 después 💵
- **GPT-3.5:** ~$0.002 por partida 💵
- **GPT-4:** ~$0.03 por partida 💵💵

### **Velocidad**

- **Stockfish:** < 500ms ⚡⚡⚡
- **Gemini:** 2-4 segundos ⚡⚡
- **GPT:** 2-5 segundos ⚡

### **Fuerza de Juego**

En nivel "master":
1. **Stockfish** - El más fuerte (~3500 ELO)
2. **GPT-4** - Fuerte (~2000-2200 ELO estimado)
3. **Gemini 1.5 Pro** - Fuerte (~2000-2200 ELO estimado)
4. **GPT-3.5 / Gemini Flash** - Intermedio (~1800-2000 ELO estimado)

---

## 🐛 Solución de Problemas

### **Error: "AI failed to generate move"**

**Posibles causas:**
1. API key no configurada o inválida
2. Sin saldo en la cuenta de OpenAI/Anthropic
3. Timeout de la API (red lenta)

**Solución:**
- Verifica las API keys en `.env`
- Revisa el saldo en tu cuenta
- El sistema hará fallback a Stockfish automáticamente

### **Advertencia: "⚠️ OpenAI API key not configured"**

**Solución:**
```bash
# Edita backend/.env
OPENAI_API_KEY=sk-proj-tu-api-key-aqui

# Reinicia el servidor
cd backend
pnpm dev
```

---

## 📝 Resumen de Configuración

```env
# backend/.env

# Para usar GPT-4 o GPT-3.5
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Para usar Gemini 1.5 Pro o Flash
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxx

# Stockfish (opcional, para motor local)
STOCKFISH_PATH=/path/to/stockfish
```

**¡Listo! Ahora puedes jugar contra GPT-4, Claude 3, o ver partidas épicas entre diferentes IAs!** 🎉♟️

---

## 🔗 Enlaces Útiles

- OpenAI Platform: https://platform.openai.com/
- Google AI Studio: https://aistudio.google.com/app/apikey
- OpenAI Pricing: https://openai.com/api/pricing/
- Gemini Pricing: https://ai.google.dev/pricing
- Stockfish: https://stockfishchess.org/

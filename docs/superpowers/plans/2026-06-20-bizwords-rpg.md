# BizWords RPG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform BizWords (single-file business vocab app) into a web-based RPG game with map, battles, shop, and skill tree.

**Architecture:** Vite + React with DOM-based grid map. State managed via React context/useReducer. IndexedDB for save/load. Each game screen is a separate React component.

**Tech Stack:** Vite, React 18, IndexedDB, CSS

---

## File Structure

```
bizwords/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── data/
│   │   └── vocab.js
│   ├── engine/
│   │   ├── state.js
│   │   ├── save.js
│   │   └── battle.js
│   ├── components/
│   │   ├── TitleScreen.jsx
│   │   ├── Overworld.jsx
│   │   ├── Battle.jsx
│   │   ├── Shop.jsx
│   │   ├── SkillTree.jsx
│   │   └── HUD.jsx
│   └── styles/
│       └── game.css
```

---

### Task 1: Project scaffold

**Files:**
- Create: `bizwords/package.json`
- Create: `bizwords/vite.config.js`
- Create: `bizwords/index.html`
- Create: `bizwords/src/main.jsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "bizwords-rpg",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BizWords RPG</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: Create src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/game.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: Install deps**

Run: `cd ~/bizwords && npm install`
Expected: `node_modules/` created, no errors

- [ ] **Step 6: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: project scaffold with Vite + React"
```

---

### Task 2: Extract vocab data

**Files:**
- Create: `bizwords/src/data/vocab.js`

- [ ] **Step 1: Create vocab.js with extracted data**

Read the VOCAB array from the original `index.html` (lines 25-1340) and export it as a module. Each entry is `[english, thai, synonyms, category, example_sentence]`.

```js
export const VOCAB = [
  ["Achieve", "สำเร็จ", "Accomplish, Attain", "Business", "She worked hard to achieve her sales target this quarter."],
  ["Accomplish", "สำเร็จ", "Achieve, Attain", "Business", "She worked hard to achieve her sales target this quarter."],
  ["Attain", "สำเร็จ", "Achieve, Accomplish", "Business", "She worked hard to achieve her sales target this quarter."],
  // ... all entries from original VOCAB array (paste entire array here)
]

export const CATEGORIES = ["Business", "Finance", "Service", "Jobs", "Marketing"]

export function getWordsByCategory(category) {
  return VOCAB.filter(v => v[3] === category)
}

export function getRandomWord(category) {
  const words = category ? getWordsByCategory(category) : VOCAB
  return words[Math.floor(Math.random() * words.length)]
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
```

Note: Copy the entire VOCAB array from the original `~/bizwords/index.html` lines 25-1340 into this file. The array is ~1300 lines.

- [ ] **Step 2: Verify data loads correctly**

Run: `node -e "import('./src/data/vocab.js').then(m => console.log(m.VOCAB.length, m.CATEGORIES))"`
Expected: prints count of vocabulary entries and categories array

- [ ] **Step 3: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: extract vocabulary data module"
```

---

### Task 3: Game state engine

**Files:**
- Create: `bizwords/src/engine/state.js`

- [ ] **Step 1: Create initial game state and reducer**

```js
import { VOCAB, getWordsByCategory, shuffle } from '../data/vocab'

export const DUNGEONS = [
  { id: 'business', name: 'Business Woods', category: 'Business', unlocked: true, cleared: false },
  { id: 'finance', name: 'Finance Cave', category: 'Finance', unlocked: false, cleared: false },
  { id: 'service', name: 'Service Tower', category: 'Service', unlocked: false, cleared: false },
  { id: 'jobs', name: 'Marketing Lab', category: 'Jobs', unlocked: false, cleared: false },
  { id: 'marketing', name: 'Marketing Lab', category: 'Marketing', unlocked: false, cleared: false },
  { id: 'boss', name: 'Boss: Corporate Dragon', category: null, unlocked: false, cleared: false },
]

export const SKILLS = [
  { id: 'double_strike', name: 'Double Strike', desc: 'โจมตี 2 เท่า', levelReq: 2, cost: 10, effect: { type: 'mult_damage', value: 2 } },
  { id: 'auto_heal', name: 'Auto Heal', desc: 'ฟื้น HP 5 ต่อคำถูก', levelReq: 3, cost: 15, effect: { type: 'heal_on_correct', value: 5 } },
  { id: 'free_hint', name: 'Free Hint', desc: '1 Hint ฟรีต่อ Battle', levelReq: 5, cost: 20, effect: { type: 'free_hint', value: 1 } },
  { id: 'xp_boost', name: 'XP Boost', desc: 'EXP +50%', levelReq: 7, cost: 25, effect: { type: 'mult_exp', value: 1.5 } },
  { id: 'ultimate', name: 'Ultimate', desc: 'ฆ่าศัตรูทันที', levelReq: 10, cost: 50, effect: { type: 'instant_kill' } },
]

export function createInitialState() {
  return {
    screen: 'title',
    player: {
      name: 'นักผจญภัย',
      hp: 50,
      maxHp: 50,
      level: 1,
      exp: 0,
      gold: 0,
      skills: [],
      items: { potion: 2, megaPotion: 0, hintToken: 1, shield: 0 },
    },
    dungeons: DUNGEONS.map(d => ({ ...d })),
    currentDungeonId: 'business',
  }
}

export function expToNext(level) {
  return 100 * level
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload }

    case 'SET_PLAYER_NAME':
      return { ...state, player: { ...state.player, name: action.payload } }

    case 'DAMAGE_PLAYER': {
      const dmg = action.payload
      const shielded = state.player.items.shield > 0
      const actualDmg = shielded ? Math.floor(dmg / 2) : dmg
      const newItems = shielded
        ? { ...state.player.items, shield: state.player.items.shield - 1 }
        : state.player.items
      return {
        ...state,
        player: {
          ...state.player,
          hp: Math.max(0, state.player.hp - actualDmg),
          items: newItems,
        },
      }
    }

    case 'HEAL_PLAYER':
      return {
        ...state,
        player: {
          ...state.player,
          hp: Math.min(state.player.maxHp, state.player.hp + action.payload),
        },
      }

    case 'ADD_EXP': {
      let { level, exp, maxHp, hp } = state.player
      const boost = state.player.skills.includes('xp_boost') ? 1.5 : 1
      exp += Math.floor(action.payload * boost)
      let next = expToNext(level)
      while (exp >= next) {
        exp -= next
        level++
        maxHp += 10
        hp = maxHp // full heal on level up
        next = expToNext(level)
      }
      return {
        ...state,
        player: { ...state.player, level, exp, maxHp, hp },
      }
    }

    case 'ADD_GOLD':
      return {
        ...state,
        player: { ...state.player, gold: state.player.gold + action.payload },
      }

    case 'BUY_ITEM': {
      const { item, cost } = action.payload
      if (state.player.gold < cost) return state
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - cost,
          items: { ...state.player.items, [item]: (state.player.items[item] || 0) + 1 },
        },
      }
    }

    case 'USE_ITEM': {
      const item = action.payload
      if ((state.player.items[item] || 0) <= 0) return state
      let newState = {
        ...state,
        player: {
          ...state.player,
          items: { ...state.player.items, [item]: state.player.items[item] - 1 },
        },
      }
      if (item === 'potion') newState = gameReducer(newState, { type: 'HEAL_PLAYER', payload: 30 })
      if (item === 'megaPotion') newState = gameReducer(newState, { type: 'HEAL_PLAYER', payload: 999 })
      return newState
    }

    case 'UNLOCK_DUNGEON':
      return {
        ...state,
        dungeons: state.dungeons.map(d =>
          d.id === action.payload ? { ...d, unlocked: true } : d
        ),
      }

    case 'CLEAR_DUNGEON':
      return {
        ...state,
        dungeons: state.dungeons.map(d =>
          d.id === action.payload ? { ...d, cleared: true } : d
        ),
      }

    case 'SET_DUNGEON':
      return { ...state, currentDungeonId: action.payload }

    case 'LEARN_SKILL': {
      const skill = SKILLS.find(s => s.id === action.payload)
      if (!skill) return state
      if (state.player.level < skill.levelReq) return state
      if (state.player.skills.includes(skill.id)) return state
      if (state.player.gold < skill.cost) return state
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - skill.cost,
          skills: [...state.player.skills, skill.id],
        },
      }
    }

    case 'LOAD_STATE':
      return { ...action.payload, screen: 'overworld' }

    default:
      return state
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: game state engine with reducer"
```

---

### Task 4: Save system

**Files:**
- Create: `bizwords/src/engine/save.js`

- [ ] **Step 1: Create IndexedDB save/load module**

```js
const DB_NAME = 'bizwords_rpg'
const DB_VER = 1
const STORE = 'save'
const KEY = 'game'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveGame(state) {
  const db = await openDB()
  const payload = JSON.parse(JSON.stringify(state))
  delete payload.screen
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(payload, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadGame() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(KEY)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function hasSave() {
  const data = await loadGame()
  return data !== null
}

export async function deleteSave() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: IndexedDB save/load system"
```

---

### Task 5: Battle logic

**Files:**
- Create: `bizwords/src/engine/battle.js`

- [ ] **Step 1: Create battle utility functions**

```js
import { getWordsByCategory, getRandomWord } from '../data/vocab'

const ENEMY_TEMPLATES = [
  { name: 'Slime', hp: 20, baseDmg: 3, goldMin: 2, goldMax: 5, expMin: 10, expMax: 15 },
  { name: 'Goblin', hp: 30, baseDmg: 5, goldMin: 3, goldMax: 8, expMin: 15, expMax: 25 },
  { name: 'Skeleton', hp: 40, baseDmg: 7, goldMin: 5, goldMax: 12, expMin: 20, expMax: 35 },
  { name: 'Orc', hp: 55, baseDmg: 9, goldMin: 8, goldMax: 15, expMin: 30, expMax: 45 },
  { name: 'Dark Mage', hp: 35, baseDmg: 12, goldMin: 10, goldMax: 20, expMin: 35, expMax: 50 },
  { name: 'Corporate Dragon', hp: 100, baseDmg: 15, goldMin: 50, goldMax: 100, expMin: 100, expMax: 200 },
]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateEnemy(dungeonLevel, isBoss = false) {
  const template = isBoss
    ? ENEMY_TEMPLATES[ENEMY_TEMPLATES.length - 1]
    : ENEMY_TEMPLATES[Math.min(dungeonLevel - 1, ENEMY_TEMPLATES.length - 2)]

  const scale = 1 + (dungeonLevel - 1) * 0.2
  return {
    name: template.name,
    hp: Math.floor(template.hp * scale),
    maxHp: Math.floor(template.hp * scale),
    baseDmg: Math.floor(template.baseDmg * scale),
    gold: rand(template.goldMin, template.goldMax),
    exp: rand(template.expMin, template.expMax),
  }
}

export function generateQuestion(category) {
  const word = getRandomWord(category)
  return {
    word: word[0],
    thai: word[1],
    synonyms: word[2],
    category: word[3],
    example: word[4],
  }
}

export function isCorrectAnswer(question, answer) {
  const correctWords = [question.word.toLowerCase(), ...question.synonyms.toLowerCase().split(', ')]
  return correctWords.includes(answer.trim().toLowerCase())
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: battle logic with enemy gen and question system"
```

---

### Task 6: App root with screen routing

**Files:**
- Create: `bizwords/src/App.jsx`

- [ ] **Step 1: Create App component**

```jsx
import { useReducer, useEffect, useCallback } from 'react'
import { createInitialState, gameReducer } from './engine/state'
import { saveGame, loadGame, hasSave } from './engine/save'
import TitleScreen from './components/TitleScreen'
import Overworld from './components/Overworld'
import Battle from './components/Battle'
import Shop from './components/Shop'
import SkillTree from './components/SkillTree'
import GameOver from './components/GameOver'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState)

  useEffect(() => {
    hasSave().then(exists => {
      if (exists) dispatch({ type: 'SET_SCREEN', payload: 'title' })
    })
  }, [])

  const save = useCallback(() => saveGame(state), [state])

  useEffect(() => {
    const handler = () => { if (state.screen !== 'title') save() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [state, save])

  const onLoadGame = useCallback(async () => {
    const data = await loadGame()
    if (data) dispatch({ type: 'LOAD_STATE', payload: data })
  }, [])

  switch (state.screen) {
    case 'title':
      return <TitleScreen onNewGame={() => dispatch({ type: 'SET_SCREEN', payload: 'overworld' })} onLoadGame={onLoadGame} />
    case 'overworld':
      return <Overworld key={state.currentDungeonId} state={state} dispatch={dispatch} />
    case 'battle':
      return <Battle state={state} dispatch={dispatch} />
    case 'shop':
      return <Shop state={state} dispatch={dispatch} />
    case 'skilltree':
      return <SkillTree state={state} dispatch={dispatch} />
    case 'gameover':
      return <GameOver state={state} dispatch={dispatch} />
    default:
      return <TitleScreen onNewGame={() => dispatch({ type: 'SET_SCREEN', payload: 'overworld' })} onLoadGame={onLoadGame} />
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: App root with screen routing"
```

---

### Task 7: TitleScreen component

**Files:**
- Create: `bizwords/src/components/TitleScreen.jsx`

- [ ] **Step 1: Create TitleScreen**

```jsx
import { useState, useEffect } from 'react'
import { hasSave } from '../engine/save'

export default function TitleScreen({ onNewGame, onLoadGame }) {
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    hasSave().then(setHasSavedGame)
  }, [])

  if (showIntro) {
    return (
      <div className="screen title-screen">
        <div className="title-content">
          <h1 className="title-logo">BizWords</h1>
          <p className="title-subtitle">RPG</p>
          <div className="title-story">
            <p>บริษัทของคุณถูกโจมตีโดย <strong>Corporate Dragon</strong></p>
            <p>คุณต้องผจญภัยผ่านดันเจี้ยนธุรกิจ เรียนรู้ศัพท์อังกฤษ</p>
            <p>เพื่อรวบรวมพลังและกู้คืนบริษัท!</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowIntro(false)}>
            เริ่มผจญภัย
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen title-screen">
      <div className="title-content">
        <h1 className="title-logo">BizWords</h1>
        <p className="title-subtitle">RPG</p>
        <div className="title-menu">
          <button className="btn btn-primary" onClick={onNewGame}>
            เริ่มเกมใหม่
          </button>
          {hasSavedGame && (
            <button className="btn btn-secondary" onClick={onLoadGame}>
              โหลดเกมต่อ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: TitleScreen component"
```

---

### Task 8: HUD component

**Files:**
- Create: `bizwords/src/components/HUD.jsx`

- [ ] **Step 1: Create HUD**

```jsx
export default function HUD({ player, dungeonName, onSave }) {
  const hpPct = Math.round((player.hp / player.maxHp) * 100)
  const expPct = Math.round((player.exp / (100 * player.level)) * 100)

  return (
    <div className="hud">
      <div className="hud-row">
        <span className="hud-name">{player.name}</span>
        <span className="hud-level">Lv.{player.level}</span>
        <span className="hud-gold">{player.gold}G</span>
        <span className="hud-dungeon">{dungeonName}</span>
      </div>
      <div className="hud-row">
        <div className="hud-bar hp-bar">
          <div className="hud-bar-fill" style={{ width: hpPct + '%' }}></div>
          <span>HP {player.hp}/{player.maxHp}</span>
        </div>
        <div className="hud-bar exp-bar">
          <div className="hud-bar-fill" style={{ width: expPct + '%' }}></div>
          <span>XP {player.exp}/{100 * player.level}</span>
        </div>
      </div>
      <div className="hud-actions">
        <button className="btn btn-small" onClick={onSave}>💾 Save</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: HUD component"
```

---

### Task 9: Overworld component

**Files:**
- Create: `bizwords/src/components/Overworld.jsx`

- [ ] **Step 1: Create Overworld with map grid and movement**

```jsx
import { useState, useEffect, useCallback } from 'react'
import { generateEnemy, generateQuestion } from '../engine/battle'
import { DUNGEONS } from '../engine/state'
import HUD from './HUD'

const TILE_SIZE = 32
const TILE_WALL = 0
const TILE_FLOOR = 1
const TILE_EXIT = 2
const TILE_SHOP = 3
const CHAR = '@'
const ENEMY = 'E'
const SHOP = '$'
const EXIT = '>'

function generateMap(dungeonId) {
  const w = 20, h = 15
  const grid = Array.from({ length: h }, () => Array(w).fill(TILE_FLOOR))

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) grid[y][x] = TILE_WALL
    }
  }

  const innerWalls = 6 + Math.floor(Math.random() * 4)
  for (let i = 0; i < innerWalls; i++) {
    const wx = 2 + Math.floor(Math.random() * (w - 4))
    const wy = 2 + Math.floor(Math.random() * (h - 4))
    const len = 2 + Math.floor(Math.random() * 3)
    const dir = Math.random() > 0.5
    for (let j = 0; j < len; j++) {
      const nx = dir ? wx + j : wx
      const ny = dir ? wy : wy + j
      if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1) grid[ny][nx] = TILE_WALL
    }
  }

  const enemies = []
  const numEnemies = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < numEnemies; i++) {
    let ex, ey
    do {
      ex = 1 + Math.floor(Math.random() * (w - 2))
      ey = 1 + Math.floor(Math.random() * (h - 2))
    } while (grid[ey][ex] !== TILE_FLOOR || (ex === 1 && ey === 1))
    enemies.push({ x: ex, y: ey })
  }

  let sx, sy
  do {
    sx = w - 2 - Math.floor(Math.random() * 3)
    sy = h - 2 - Math.floor(Math.random() * 3)
  } while (grid[sy][sx] !== TILE_FLOOR)
  grid[sy][sx] = TILE_EXIT

  let shx, shy
  do {
    shx = 2 + Math.floor(Math.random() * (w - 4))
    shy = 2 + Math.floor(Math.random() * (h - 4))
  } while (grid[shy][shx] !== TILE_FLOOR || (shx === 1 && shy === 1) || Math.abs(shx - sx) + Math.abs(shy - sy) < 5)
  grid[shy][shx] = TILE_SHOP

  return { grid, enemies, playerPos: { x: 1, y: 1 }, shopPos: { x: shx, y: shy }, exitPos: { x: sx, y: sy } }
}

export default function Overworld({ state, dispatch }) {
  const dungeon = DUNGEONS.find(d => d.id === state.currentDungeonId)
  const [mapData, setMapData] = useState(() => generateMap(state.currentDungeonId))
  const [pos, setPos] = useState({ x: 1, y: 1 })
  const [message, setMessage] = useState('')
  const [enemies, setEnemies] = useState(mapData.enemies)

  const movePlayer = useCallback((dx, dy) => {
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (ny < 0 || ny >= mapData.grid.length || nx < 0 || nx >= mapData.grid[0].length) return
    if (mapData.grid[ny][nx] === TILE_WALL) return

    setPos({ x: nx, y: ny })

    const enemyHit = enemies.find(e => e.x === nx && e.y === ny)
    if (enemyHit) {
      const dungeonLevel = state.dungeons.find(d => d.id === state.currentDungeonId)?.cleared
        ? 2 : 1
      const enemy = generateEnemy(dungeonLevel)
      const question = generateQuestion(dungeon?.category || null)
      dispatch({ type: 'SET_SCREEN', payload: 'battle' })
      window.__battleData = { enemy, question, dungeonId: state.currentDungeonId, enemyIndex: enemies.indexOf(enemyHit) }
      return
    }

    if (mapData.grid[ny][nx] === TILE_SHOP) {
      dispatch({ type: 'SET_SCREEN', payload: 'shop' })
      return
    }

    if (mapData.grid[ny][nx] === TILE_EXIT) {
      dispatch({ type: 'CLEAR_DUNGEON', payload: state.currentDungeonId })
      const dungeons = state.dungeons
      const curIdx = dungeons.findIndex(d => d.id === state.currentDungeonId)
      if (curIdx >= 0 && curIdx < dungeons.length - 1) {
        const next = dungeons[curIdx + 1]
        dispatch({ type: 'UNLOCK_DUNGEON', payload: next.id })
        dispatch({ type: 'SET_DUNGEON', payload: next.id })
      }
      setMessage('เคลียร์ดันเจี้ยนแล้ว! 🎉')
      return
    }
  }, [pos, mapData, enemies, state, dispatch, dungeon])

  useEffect(() => {
    const handler = (e) => {
      const keyMap = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      }
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        movePlayer(dir[0], dir[1])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [movePlayer])

  const handlePlayerAttack = useCallback(() => {
    return { type: 'DAMAGE_PLAYER', payload: 5 }
  }, [])

  return (
    <div className="screen overworld-screen">
      <HUD
        player={state.player}
        dungeonName={dungeon?.name || ''}
        onSave={() => { /* save is handled by App */ }}
      />
      <div className="map-container">
        {mapData.grid.map((row, y) => (
          <div key={y} className="map-row">
            {row.map((tile, x) => {
              const isPlayer = pos.x === x && pos.y === y
              const isEnemy = enemies.some(e => e.x === x && e.y === y)
              const isExit = tile === TILE_EXIT
              const isShop = tile === TILE_SHOP
              let className = 'tile'
              if (tile === TILE_WALL) className += ' tile-wall'
              else className += ' tile-floor'
              if (isPlayer) className += ' tile-player'
              if (isEnemy) className += ' tile-enemy'
              let content = ''
              if (isPlayer) content = '@'
              else if (isEnemy) content = 'E'
              else if (isExit) content = '>'
              else if (isShop) content = '$'
              return <div key={x} className={className}>{content}</div>
            })}
          </div>
        ))}
      </div>
      {message && <div className="map-message">{message}</div>}
      <div className="map-controls">
        <button className="btn btn-small" onClick={() => movePlayer(0, -1)}>↑</button>
        <div>
          <button className="btn btn-small" onClick={() => movePlayer(-1, 0)}>←</button>
          <button className="btn btn-small" onClick={() => movePlayer(0, 1)}>↓</button>
          <button className="btn btn-small" onClick={() => movePlayer(1, 0)}>→</button>
        </div>
        <button className="btn btn-small" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'skilltree' })}>
          ทักษะ
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: Overworld with map, movement, and encounters"
```

---

### Task 10: Battle component

**Files:**
- Create: `bizwords/src/components/Battle.jsx`

- [ ] **Step 1: Create Battle component**

```jsx
import { useState, useEffect, useRef } from 'react'
import { isCorrectAnswer } from '../engine/battle'

export default function Battle({ state, dispatch }) {
  const data = window.__battleData || { enemy: { name: 'Slime', hp: 20, maxHp: 20, exp: 10, gold: 3 }, question: { word: 'hello', thai: 'สวัสดี', example: 'Hello world' }, dungeonId: 'business', enemyIndex: 0 }
  const { enemy, question, enemyIndex } = data
  const [enemyHp, setEnemyHp] = useState(enemy.hp)
  const [typed, setTyped] = useState('')
  const [hintUsed, setHintUsed] = useState(false)
  const [battleLog, setBattleLog] = useState([])
  const [battleOver, setBattleOver] = useState(false)
  const [answering, setAnswering] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const freeHintAvailable = state.player.skills.includes('free_hint')

  function addLog(msg) {
    setBattleLog(prev => [...prev.slice(-5), msg])
  }

  function handleSubmit() {
    if (answering || !typed.trim()) return
    setAnswering(true)

    const correct = isCorrectAnswer(question, typed)
    if (correct) {
      const hasDoubleStrike = state.player.skills.includes('double_strike')
      const dmg = hasDoubleStrike ? 20 : 10
      const newHp = enemyHp - dmg
      setEnemyHp(newHp)
      addLog(`⚔️ โจมตี! ถูกต้อง! (-${dmg} HP)`)

      if (state.player.skills.includes('auto_heal')) {
        dispatch({ type: 'HEAL_PLAYER', payload: 5 })
        addLog('💚 Auto Heal +5 HP')
      }

      if (newHp <= 0) {
        const hasUltimate = state.player.skills.includes('ultimate')
        const expReward = hasUltimate ? enemy.exp * 2 : enemy.exp
        dispatch({ type: 'ADD_EXP', payload: expReward })
        dispatch({ type: 'ADD_GOLD', payload: enemy.gold })
        addLog(`💀 ชนะ! ได้ EXP ${expReward} + ${enemy.gold}G`)
        setBattleOver(true)
      } else {
        setTyped('')
        setHintUsed(false)
        setAnswering(false)
        inputRef.current?.focus()
      }
    } else {
      dispatch({ type: 'DAMAGE_PLAYER', payload: enemy.baseDmg })
      addLog(`💥 ผิด! เสีย HP ${enemy.baseDmg}`)
      setTyped('')
      setHintUsed(false)
      setAnswering(false)
      inputRef.current?.focus()
    }
  }

  function handleHint() {
    if (hintUsed && state.player.items.hintToken <= 0 && !freeHintAvailable) return
    if (!hintUsed && !freeHintAvailable && state.player.items.hintToken <= 0) return
    if (!hintUsed && !freeHintAvailable) {
      dispatch({ type: 'USE_ITEM', payload: 'hintToken' })
    }
    const firstLetter = question.word[0]
    setTyped(firstLetter)
    setHintUsed(true)
    addLog(`💡 Hint: ขึ้นต้นด้วย "${firstLetter}"`)
  }

  function handleFlee() {
    addLog('🏃 หนี!')
    setBattleOver(true)
  }

  function handleContinue() {
    delete window.__battleData
    if (state.player.hp <= 0) {
      dispatch({ type: 'SET_SCREEN', payload: 'gameover' })
    } else {
      dispatch({ type: 'SET_SCREEN', payload: 'overworld' })
    }
  }

  const hpPct = Math.max(0, Math.round((enemyHp / enemy.maxHp) * 100))

  return (
    <div className="screen battle-screen">
      <div className="battle-enemy">
        <div className="enemy-sprite">{enemy.name === 'Corporate Dragon' ? '🐉' : '👹'}</div>
        <div className="enemy-name">{enemy.name}</div>
        <div className="battle-bar">
          <div className="battle-bar-fill" style={{ width: hpPct + '%' }}></div>
          <span>HP {Math.max(0, enemyHp)}/{enemy.maxHp}</span>
        </div>
      </div>

      <div className="battle-question">
        <p className="question-thai">"{question.thai}"</p>
        <p className="question-hint">แปลว่าอะไร?</p>
        {question.example && (
          <p className="question-example">เช่น: {question.example}</p>
        )}
      </div>

      <div className="battle-input-area">
        <input
          ref={inputRef}
          type="text"
          className="battle-input"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          disabled={battleOver}
          placeholder="พิมพ์คำตอบ..."
        />
        <div className="battle-buttons">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={battleOver || !typed.trim()}>
            ยืนยัน
          </button>
          {(freeHintAvailable || state.player.items.hintToken > 0) && !hintUsed && !battleOver && (
            <button className="btn btn-secondary" onClick={handleHint}>
              💡 Hint
            </button>
          )}
          {!battleOver && (
            <button className="btn btn-secondary" onClick={handleFlee}>
              🏃 หนี
            </button>
          )}
        </div>
      </div>

      <div className="battle-log">
        {battleLog.map((msg, i) => <p key={i}>{msg}</p>)}
      </div>

      <div className="battle-player-hp">
        HP: {state.player.hp}/{state.player.maxHp}
        <div className="battle-bar">
          <div className="battle-bar-fill" style={{ width: Math.round((state.player.hp / state.player.maxHp) * 100) + '%' }}></div>
        </div>
      </div>

      {battleOver && (
        <button className="btn btn-primary" onClick={handleContinue}>
          ดำเนินการต่อ
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: Battle component with vocabulary combat"
```

---

### Task 11: Shop component

**Files:**
- Create: `bizwords/src/components/Shop.jsx`

- [ ] **Step 1: Create Shop component**

```jsx
const SHOP_ITEMS = [
  { id: 'potion', name: 'Potion', desc: 'ฟื้น HP 30', price: 50 },
  { id: 'megaPotion', name: 'Mega Potion', desc: 'ฟื้น HP เต็ม', price: 120 },
  { id: 'hintToken', name: 'Hint Token', desc: 'ใช้ใบ้คำตอบ 1 ครั้ง', price: 30 },
  { id: 'shield', name: 'Shield', desc: 'ลดดาเมจ 50% (1 ครั้ง)', price: 80 },
]

export default function Shop({ state, dispatch }) {
  return (
    <div className="screen shop-screen">
      <h2>🏪 ร้านค้า</h2>
      <p className="shop-gold">Gold: {state.player.gold}G</p>
      <div className="shop-items">
        {SHOP_ITEMS.map(item => (
          <div key={item.id} className="shop-item">
            <div className="shop-item-info">
              <strong>{item.name}</strong>
              <p>{item.desc}</p>
              <small>มี: {state.player.items[item.id] || 0}</small>
            </div>
            <div className="shop-item-action">
              <span className="shop-price">{item.price}G</span>
              <button
                className="btn btn-small"
                onClick={() => dispatch({ type: 'BUY_ITEM', payload: { item: item.id, cost: item.price } })}
                disabled={state.player.gold < item.price}
              >
                ซื้อ
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'overworld' })}>
        กลับ
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: Shop component"
```

---

### Task 12: SkillTree component

**Files:**
- Create: `bizwords/src/components/SkillTree.jsx`

- [ ] **Step 1: Create SkillTree component**

```jsx
import { SKILLS } from '../engine/state'

export default function SkillTree({ state, dispatch }) {
  const { player } = state

  return (
    <div className="screen skilltree-screen">
      <h2>🌳 Skill Tree</h2>
      <p className="skilltree-info">
        Level {player.level} | Gold: {player.gold}G | EXP: {player.exp}/{100 * player.level}
      </p>
      <div className="skill-list">
        {SKILLS.map(skill => {
          const unlocked = player.skills.includes(skill.id)
          const canUnlock = player.level >= skill.levelReq && !unlocked && player.gold >= skill.cost
          return (
            <div key={skill.id} className={`skill-item ${unlocked ? 'skill-unlocked' : ''}`}>
              <div className="skill-info">
                <strong>{skill.name}</strong>
                <p>{skill.desc}</p>
                <small>ต้องใช้ Lv.{skill.levelReq} | ค่าใช้จ่าย: {skill.cost}G</small>
              </div>
              {unlocked ? (
                <span className="skill-status">✅</span>
              ) : (
                <button
                  className="btn btn-small"
                  onClick={() => dispatch({ type: 'LEARN_SKILL', payload: skill.id })}
                  disabled={!canUnlock}
                >
                  {player.level < skill.levelReq ? `ต้อง Lv.${skill.levelReq}` : `ปลดล็อค ${skill.cost}G`}
                </button>
              )}
            </div>
          )
        })}
      </div>
      <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'overworld' })}>
        กลับ
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: SkillTree component"
```

---

### Task 13: GameOver component

**Files:**
- Create: `bizwords/src/components/GameOver.jsx`

- [ ] **Step 1: Create GameOver component**

```jsx
import { saveGame } from '../engine/save'

export default function GameOver({ state, dispatch }) {
  return (
    <div className="screen gameover-screen">
      <h1>💀 Game Over</h1>
      <p>Level: {state.player.level}</p>
      <p>Gold: {state.player.gold}G</p>
      <p>Skills: {state.player.skills.length}</p>
      <div className="gameover-buttons">
        <button className="btn btn-primary" onClick={() => {
          saveGame(state)
          dispatch({ type: 'SET_SCREEN', payload: 'title' })
        }}>
          กลับหน้าแรก
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: GameOver component"
```

---

### Task 14: CSS styles

**Files:**
- Create: `bizwords/src/styles/game.css`

- [ ] **Step 1: Create game.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { height: 100%; background: #0A0A0A; color: #E0E0E0; font-family: 'Inter', sans-serif; }

.screen { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; }

/* Title */
.title-logo { font-size: 3rem; font-weight: 700; color: #00D4AA; }
.title-subtitle { font-size: 1.5rem; color: #888; margin-bottom: 24px; }
.title-story { max-width: 400px; text-align: center; margin-bottom: 24px; line-height: 1.6; color: #AAA; }
.title-menu { display: flex; flex-direction: column; gap: 12px; }

/* Buttons */
.btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-family: inherit; transition: opacity .15s; }
.btn:hover { opacity: .8; }
.btn:disabled { opacity: .4; cursor: not-allowed; }
.btn-primary { background: #00D4AA; color: #0A0A0A; font-weight: 600; }
.btn-secondary { background: #2A2A2A; color: #E0E0E0; }
.btn-small { padding: 6px 12px; font-size: .85rem; }

/* HUD */
.hud { width: 100%; max-width: 700px; padding: 8px 12px; background: #111; border-radius: 8px; margin-bottom: 8px; }
.hud-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; flex-wrap: wrap; }
.hud-name { font-weight: 600; }
.hud-level { color: #00D4AA; }
.hud-gold { color: #FFD700; }
.hud-dungeon { color: #888; font-size: .85rem; }
.hud-bar { flex: 1; min-width: 100px; height: 20px; background: #2A2A2A; border-radius: 4px; position: relative; overflow: hidden; }
.hud-bar-fill { height: 100%; transition: width .3s; }
.hp-bar .hud-bar-fill { background: #E53935; }
.exp-bar .hud-bar-fill { background: #00D4AA; }
.hud-bar span { position: absolute; left: 8px; top: 2px; font-size: .75rem; color: #FFF; }
.hud-actions { display: flex; gap: 4px; }

/* Map */
.map-container { display: flex; flex-direction: column; gap: 0; background: #1A1A1A; padding: 8px; border-radius: 8px; }
.map-row { display: flex; }
.tile { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-family: 'JetBrains Mono', monospace; }
.tile-wall { background: #2A2A2A; color: #555; }
.tile-floor { background: #1A1A1A; }
.tile-player { background: #00D4AA; color: #0A0A0A; border-radius: 50%; font-weight: 700; }
.tile-enemy { color: #E53935; font-weight: 700; }
.map-message { margin-top: 8px; padding: 8px; background: #1E6640; border-radius: 4px; font-size: .9rem; }
.map-controls { display: flex; align-items: center; gap: 8px; margin-top: 8px; }

/* Battle */
.battle-screen { justify-content: flex-start; padding-top: 40px; }
.battle-enemy { text-align: center; margin-bottom: 20px; }
.enemy-sprite { font-size: 3rem; }
.enemy-name { font-size: 1.2rem; font-weight: 600; margin-top: 4px; }
.battle-bar { width: 250px; height: 22px; background: #2A2A2A; border-radius: 4px; position: relative; overflow: hidden; margin: 8px auto; }
.battle-bar-fill { height: 100%; background: #E53935; transition: width .3s; }
.battle-bar span { position: absolute; left: 8px; top: 2px; font-size: .8rem; color: #FFF; }
.battle-question { text-align: center; margin-bottom: 16px; }
.question-thai { font-size: 1.5rem; font-weight: 600; color: #00D4AA; }
.question-hint { color: #888; margin-top: 4px; }
.question-example { color: #666; font-size: .85rem; margin-top: 8px; font-style: italic; }
.battle-input-area { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 12px; }
.battle-input { width: 300px; padding: 10px 14px; background: #1A1A1A; border: 1px solid #333; border-radius: 8px; color: #E0E0E0; font-size: 1.1rem; font-family: 'JetBrains Mono', monospace; text-align: center; }
.battle-input:focus { outline: none; border-color: #00D4AA; }
.battle-buttons { display: flex; gap: 8px; }
.battle-log { width: 100%; max-width: 400px; margin-bottom: 12px; }
.battle-log p { padding: 4px 8px; background: #111; border-radius: 4px; margin-bottom: 4px; font-size: .85rem; }
.battle-player-hp { text-align: center; margin-bottom: 12px; font-size: .9rem; }

/* Shop */
.shop-screen { justify-content: flex-start; padding-top: 40px; gap: 16px; }
.shop-gold { color: #FFD700; font-size: 1.1rem; }
.shop-items { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 8px; }
.shop-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #111; border-radius: 8px; }
.shop-item-info small { color: #666; }
.shop-item-action { display: flex; align-items: center; gap: 8px; }
.shop-price { color: #FFD700; font-weight: 600; }

/* Skill Tree */
.skilltree-screen { justify-content: flex-start; padding-top: 40px; gap: 16px; }
.skilltree-info { color: #888; }
.skill-list { width: 100%; max-width: 450px; display: flex; flex-direction: column; gap: 8px; }
.skill-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #111; border-radius: 8px; }
.skill-unlocked { border: 1px solid #00D4AA; }
.skill-info small { color: #666; }
.skill-status { font-size: 1.5rem; }

/* Game Over */
.gameover-screen { gap: 16px; }
.gameover-screen h1 { color: #E53935; }
.gameover-buttons { display: flex; gap: 12px; margin-top: 16px; }
```

- [ ] **Step 2: Commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: game CSS styles"
```

---

### Task 15: Install and verify build

- [ ] **Step 1: Install dependencies**

```bash
cd ~/bizwords && npm install
```

Expected: no errors, `node_modules/` exists

- [ ] **Step 2: Build the project**

```bash
cd ~/bizwords && npm run build
```

Expected: `dist/` folder created, build succeeds with no errors

- [ ] **Step 3: Start dev server and test**

```bash
cd ~/bizwords && npm run dev
```

Open browser to the URL shown (usually `http://localhost:5173`). Verify:
- Title screen shows with "เริ่มเกมใหม่" button
- Click → Overworld shows with map grid
- Arrow keys move the character
- Walking into enemy → Battle screen with question
- Typing correct/incorrect answer works
- HP/EXP updates correctly

- [ ] **Step 4: Final commit**

```bash
cd ~/bizwords
git add -A
git commit -m "feat: initial working BizWords RPG"
```

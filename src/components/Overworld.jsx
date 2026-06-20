import { useState, useEffect, useCallback } from 'react'
import { generateEnemy, generateQuestion } from '../engine/battle'
import { DUNGEONS } from '../engine/state'
import HUD from './HUD'

const TILE_WALL = 0
const TILE_FLOOR = 1
const TILE_EXIT = 2
const TILE_SHOP = 3

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

  return { grid, enemies, exitPos: { x: sx, y: sy }, shopPos: { x: shx, y: shy } }
}

export default function Overworld({ state, dispatch }) {
  const dungeon = DUNGEONS.find(d => d.id === state.currentDungeonId)
  const [mapData, setMapData] = useState(() => generateMap(state.currentDungeonId))
  const [pos, setPos] = useState({ x: 1, y: 1 })
  const [enemies, setEnemies] = useState(mapData.enemies)
  const [message, setMessage] = useState('')

  const movePlayer = useCallback((dx, dy) => {
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (ny < 0 || ny >= mapData.grid.length || nx < 0 || nx >= mapData.grid[0].length) return
    if (mapData.grid[ny][nx] === TILE_WALL) return

    setPos({ x: nx, y: ny })

    const enemyHit = enemies.find(e => e.x === nx && e.y === ny)
    if (enemyHit) {
      const dungeonLevel = state.dungeons.find(d => d.id === state.currentDungeonId)?.cleared ? 2 : 1
      const enemy = generateEnemy(dungeonLevel)
      const question = generateQuestion(dungeon?.category || null)
      window.__battleData = { enemy, question, dungeonId: state.currentDungeonId, enemyIndex: enemies.indexOf(enemyHit) }
      dispatch({ type: 'SET_SCREEN', payload: 'battle' })
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

  return (
    <div className="screen overworld-screen">
      <HUD
        player={state.player}
        dungeonName={dungeon?.name || ''}
        onSave={() => {}}
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
        <div>
          <button className="btn btn-small" onClick={() => movePlayer(0, -1)}>↑</button>
        </div>
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

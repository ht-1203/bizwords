import { useState, useEffect, useRef } from 'react'
import { isCorrectAnswer } from '../engine/battle'

export default function Battle({ state, dispatch }) {
  const data = window.__battleData || {
    enemy: { name: 'Slime', hp: 20, maxHp: 20, exp: 10, gold: 3 },
    question: { word: 'hello', thai: 'สวัสดี', example: 'Hello world' },
    dungeonId: 'business',
    enemyIndex: 0
  }
  const { enemy, question } = data

  const [enemyHp, setEnemyHp] = useState(enemy.hp)
  const [typed, setTyped] = useState('')
  const [hintUsed, setHintUsed] = useState(false)
  const [battleLog, setBattleLog] = useState([])
  const [battleOver, setBattleOver] = useState(false)
  const [answering, setAnswering] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

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
        const expReward = state.player.skills.includes('ultimate') ? enemy.exp * 2 : enemy.exp
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
          <div className="battle-bar-fill" style={{
            width: Math.round((state.player.hp / state.player.maxHp) * 100) + '%'
          }}></div>
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

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

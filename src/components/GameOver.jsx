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

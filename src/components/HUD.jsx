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

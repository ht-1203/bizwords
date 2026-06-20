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

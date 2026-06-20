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

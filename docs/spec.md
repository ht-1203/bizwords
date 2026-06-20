# BizWords RPG — Design Spec

## Overview
เปลี่ยน BizWords (app เรียนศัพท์ภาษาอังกฤษธุรกิจ ภาษาไทย <-> อังกฤษ) เป็นแนวเกม RPG บนเว็บ
โดยใช้ React + DOM grid, แยกโครงสร้างไฟล์ให้จัดการง่าย

## Project Structure
```
bizwords/
├── index.html
├── vite.config.js
├── package.json
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

## Game Flow
```
TitleScreen -> Overworld -> Battle (เดินชนศัตรู)
                          -> Shop (เดินเข้าร้าน)
                          -> Inventory/SkillTree (กด I)
                          -> Pause Menu (Esc: Save/Load/Quit)
```

## Map / Dungeon (Overworld)
- Grid 20x20 turn-based
- ตัวละคร (@), ศัตรู (E), ร้าน ($), ทางออก (>), กำแพง (█)
- เดินด้วย WASD หรือลูกศร
- 5 ดันเจี้ยน: Business Woods, Finance Cave, Service Tower, Marketing Lab, Boss

## Battle System
- เห็นคำแปล → พิมพ์คำศัพท์ภาษาอังกฤษ
- ถูก = โจมตีศัตรู (base 10 dmg)
- ผิด = เสีย HP (base 5 dmg)
- Hint = เผยตัวอักษรแรก
- ศัตรู HP ≤ 0 = ชนะ (EXP + Gold + ดรอป)
- Player HP ≤ 0 = Game Over

## RPG Systems
### HP/Level
- HP เริ่ม 50, +10/level
- Level up ทุก 100 EXP × level
- Game Over = กลับ Title

### Shop
| Item | Price | Effect |
|------|-------|--------|
| Potion | 50G | ฟื้น HP 30 |
| Mega Potion | 120G | ฟื้น HP เต็ม |
| Hint Token | 30G | ใบ้ 1 ครั้ง |
| Shield | 80G | ลดดาเมจ 50% |

### Skill Tree (ปลดด้วย Level)
- Lv.2: Double Strike — โจมตี 2 เท่า (10 EXP)
- Lv.3: Auto Heal — ฟื้น HP 5 ต่อคำถูก (15 EXP)
- Lv.5: Free Hint — 1 Hint ฟรี/Battle (20 EXP)
- Lv.7: XP Boost — EXP +50% (25 EXP)
- Lv.10: Ultimate — ฆ่าศัตรูทันที (50 EXP)

### Persistence
- IndexedDB (ของเดิม)
- Save: Level, EXP, Gold, HP, Skills, Progress (ดันเจี้ยนที่ปลดล็อค)

## Data
- คำศัพท์จาก VOCAB array (Business, Finance, Service, Jobs, Marketing)
- ศัตรูใช้คำศัพท์ตามหมวดดันเจี้ยน

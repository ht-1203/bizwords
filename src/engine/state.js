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
        hp = maxHp
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

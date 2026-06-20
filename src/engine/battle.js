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

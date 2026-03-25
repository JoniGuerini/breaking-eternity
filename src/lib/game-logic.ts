import Decimal from "break_eternity.js"

export interface Generator {
  id: string
  name: string
  level: number
  baseCost: Decimal
  baseProduction: Decimal
  duration: number // in ms
  progress: number // 0 to 1
  /** Expoentes e com marco 10^e já resgatado (e >= 1 → 10, 100, 1k, …). */
  claimedMilestoneExponents: number[]
}

export interface GameState {
  resources: Decimal
  showFps: boolean
  lastSaveTime: number
  generators: Record<string, Generator>
  /** Moeda de marcos (futuras melhorias). */
  milestoneCurrency: number
}

export const INITIAL_STATE: GameState = {
  resources: new Decimal(10),
  showFps: true,
  lastSaveTime: Date.now(),
  milestoneCurrency: 0,
  generators: {
    generator1: {
      id: "generator1",
      name: "Gerador 1",
      level: 0,
      baseCost: new Decimal(10),
      baseProduction: new Decimal(3),
      duration: 2000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator2: {
      id: "generator2",
      name: "Gerador 2",
      level: 0,
      baseCost: new Decimal(100),
      baseProduction: new Decimal(4),
      duration: 4000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator3: {
      id: "generator3",
      name: "Gerador 3",
      level: 0,
      baseCost: new Decimal(1000),
      baseProduction: new Decimal(5),
      duration: 8000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator4: {
      id: "generator4",
      name: "Gerador 4",
      level: 0,
      baseCost: new Decimal(10000),
      baseProduction: new Decimal(6),
      duration: 16000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator5: {
      id: "generator5",
      name: "Gerador 5",
      level: 0,
      baseCost: new Decimal(100000),
      baseProduction: new Decimal(7),
      duration: 32000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator6: {
      id: "generator6",
      name: "Gerador 6",
      level: 0,
      baseCost: new Decimal(1000000),
      baseProduction: new Decimal(8),
      duration: 64000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator7: {
      id: "generator7",
      name: "Gerador 7",
      level: 0,
      baseCost: new Decimal(10000000),
      baseProduction: new Decimal(9),
      duration: 128000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator8: {
      id: "generator8",
      name: "Gerador 8",
      level: 0,
      baseCost: new Decimal(100000000),
      baseProduction: new Decimal(10),
      duration: 256000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator9: {
      id: "generator9",
      name: "Gerador 9",
      level: 0,
      baseCost: new Decimal(1000000000),
      baseProduction: new Decimal(11),
      duration: 512000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
    generator10: {
      id: "generator10",
      name: "Gerador 10",
      level: 0,
      baseCost: new Decimal(10000000000),
      baseProduction: new Decimal(12),
      duration: 1024000,
      progress: 0,
      claimedMilestoneExponents: [],
    },
  },
}

const getLetterSuffix = (index: number): string => {
  let lettersCount = 2
  let currentIdx = index
  
  while (true) {
    const combinations = Math.pow(26, lettersCount)
    if (currentIdx < combinations) break
    currentIdx -= combinations
    lettersCount++
    if (lettersCount > 5) return "???" // Limit per user request (999 ZZZZZ)
  }
  
  let result = ""
  for (let i = 0; i < lettersCount; i++) {
    const charCode = Math.floor(currentIdx / Math.pow(26, lettersCount - i - 1)) % 26
    result += String.fromCharCode(65 + charCode)
  }
  return ` ${result}` // Add space before suffix
}

/** Produção aplicada a níveis de gerador: inteiro estável (evita float e overflow silencioso em toNumber). */
export const productionToIntegerLevels = (d: Decimal): number => {
  try {
    if (!d.isFinite() || d.lte(0)) return 0
    const n = d.floor().toNumber()
    if (!Number.isFinite(n) || n <= 0) return 0
    return Math.min(n, Number.MAX_SAFE_INTEGER)
  } catch {
    return 0
  }
}

const MAX_MILESTONE_EXP = 300

/** Marco procedural: 10, 100, 1k… → expoente e ≥ 1 representa 10^e. */
export function milestoneThresholdFromExponent(exp: number): number {
  if (exp < 1 || !Number.isFinite(exp)) return NaN
  return Math.pow(10, exp)
}

/** Maior marco 10^e (e≥1) com 10^e ≤ level; 0 se level < 10. */
export function getPrevMilestoneThreshold(level: number): number {
  if (level < 10) return 0
  let m = 10
  while (m <= level / 10 && m < Number.MAX_VALUE / 10) {
    const next = m * 10
    if (next > level) break
    m = next
  }
  return m
}

/** Próximo marco estritamente acima do nível atual (sempre 10^e). */
export function getNextMilestoneThreshold(level: number): number {
  if (level < 10) return 10
  let m = 10
  while (m <= level) {
    if (m > Number.MAX_VALUE / 10) {
      const e = Math.floor(Math.log10(level)) + 1
      return Math.pow(10, e)
    }
    m *= 10
  }
  return m
}

/** Próximo limiar de marco a exibir / perseguir: menor 10^e não resgatado com 10^e ≥ nível. */
export function getNextMilestoneGoalForBar(
  level: number,
  claimed: readonly number[]
): number {
  const set = new Set(claimed)
  for (let e = 1; e <= MAX_MILESTONE_EXP; e++) {
    const th = milestoneThresholdFromExponent(e)
    if (!Number.isFinite(th)) break
    if (set.has(e)) continue
    if (th >= level) return th
  }
  return getNextMilestoneThreshold(level)
}

/** Barra 0–1 entre o limiar anterior (goal/10) e o próximo marco ainda não resgatado. */
export function getMilestoneBarProgress(
  level: number,
  claimed: readonly number[]
): number {
  if (level < 0) return 0
  const goal = getNextMilestoneGoalForBar(level, claimed)
  if (goal <= 10) {
    return Math.min(1, Math.max(0, level / Math.max(goal, 10)))
  }
  const prevBound = goal / 10
  if (goal <= prevBound) return 1
  return Math.min(1, Math.max(0, (level - prevBound) / (goal - prevBound)))
}

/** Quantos marcos elegíveis (nível atual ≥ 10^e) ainda não resgatados. */
export function countPendingMilestones(
  level: number,
  claimedExponents: readonly number[]
): number {
  const claimed = new Set(claimedExponents)
  let n = 0
  for (let e = 1; e <= MAX_MILESTONE_EXP; e++) {
    const th = milestoneThresholdFromExponent(e)
    if (!Number.isFinite(th) || th > level) break
    if (!claimed.has(e)) n++
  }
  return n
}

/** Resgata todos os marcos atualmente válidos (1 moeda por marco). */
export function claimEligibleMilestones(
  level: number,
  claimedExponents: readonly number[]
): { nextClaimed: number[]; coinsGained: number } {
  const set = new Set(claimedExponents)
  let coinsGained = 0
  for (let e = 1; e <= MAX_MILESTONE_EXP; e++) {
    const th = milestoneThresholdFromExponent(e)
    if (!Number.isFinite(th) || th > level) break
    if (!set.has(e)) {
      set.add(e)
      coinsGained++
    }
  }
  const nextClaimed = [...set].sort((a, b) => a - b)
  return { nextClaimed, coinsGained }
}

export const formatNumber = (num: Decimal): string => {
  if (num.lt(1000)) return num.floor().toString()
  
  if (num.lt(1000000)) {
    // Portuguese format: 1.000
    return Math.floor(num.toNumber()).toLocaleString('pt-BR')
  }

  const standardSuffixes = ["", " M", " B", " T", " Qa", " Qi", " Sx", " Sp", " Oc", " No"]
  // log10() devolve Decimal; Math.floor(Decimal) era coerção frágil (valueOf → string).
  const logN = num.log10().toNumber()
  if (!Number.isFinite(logN)) return num.toString()
  const exp = Math.floor(logN)
  const suffixIdx = Math.floor(exp / 3) - 1
  
  if (suffixIdx < 0) return Math.floor(num.toNumber()).toLocaleString('pt-BR')
  
  // Choose suffix type
  let suffix = ""
  if (suffixIdx < standardSuffixes.length) {
    suffix = standardSuffixes[suffixIdx]
  } else {
    // Start letter suffixes from suffixIdx 10 (Decillions)
    suffix = getLetterSuffix(suffixIdx - 10)
  }
  
  const value = num.div(new Decimal(10).pow((suffixIdx + 1) * 3))
  const formattedValue = value.lt(10) 
    ? value.toFixed(1).replace(".", ",") 
    : value.toFixed(0)
    
  // Clean up if trailing ,0 (e.g. 1,0 M -> 1 M)
  const finalValue = formattedValue.endsWith(",0") 
    ? formattedValue.split(",")[0] 
    : formattedValue

  return `${finalValue}${suffix}`
}

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}

export const getGeneratorCost = (generator: Generator): Decimal => {
  // Cost formula: baseCost * 1.5 ^ level
  return generator.baseCost.times(new Decimal(1.5).pow(generator.level))
}

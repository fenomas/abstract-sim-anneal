import { AnnealingSolver } from '../src/solver'

// pseudo-random locations for reproducibility
const makeLocations = (n: number) => {
  const frac = (n = 1) => n - Math.floor(n)
  let x = Math.sqrt(13)
  const rand = () => frac((x = (17 / 13) * frac(x * 1000)))
  return Array.from(Array(n), () => [rand(), rand()])
}

/**
 *    Test rig for tuning the solver:
 *    run SA on a traveling salesman problem
 */

const runTSP = (numLocs: number, budget: number) => {
  const locs = makeLocations(numLocs)
  locs.sort(() => Math.random() - 0.5)

  // helpers
  const pairDist = (i: number, j: number) =>
    Math.hypot(locs[i][0] - locs[j][0], locs[i][1] - locs[j][1])
  const totalDist = (path: number[]) =>
    path.reduce((acc, loc, i) => acc + pairDist(loc, path[(i + 1) % path.length]), 0)
  const swap = (path: number[], i: number, j: number) => {
    ;[path[i], path[j]] = [path[j], path[i]]
    return path
  }

  // create the solver
  let best = Infinity
  const solver = new AnnealingSolver<number[], number[]>({
    chooseMove: (state) => {
      const prev = totalDist(state)
      const i = Math.floor(Math.random() * state.length)
      let j = Math.floor(Math.random() * state.length)
      if (i === j) j = (i + 1) % state.length
      swap(state, i, j)
      const curr = totalDist(state)
      swap(state, i, j)
      if (curr < best) best = curr
      return { move: [i, j], errorDelta: curr - prev }
    },
    applyMove: (state, locs) => swap(state, locs[0], locs[1]),
  })

  // run the solver
  // solver.coolingFunction = AnnealingSolver.TEMP_LINEAR
  solver.iterationBudget = budget
  let state = locs.map((_, i) => i)
  const batches = 10
  const swapCts = [0]
  for (let i = 0; i < batches; i++) {
    ;({ state, numMoves: swapCts[i] } = solver.run(state, budget / batches))
  }
  return { swaps: swapCts, best, learnedK: solver.learnedK, result: totalDist(state) }
}

/**
 *
 *
 *      run some trials
 *
 *
 */

const getAnswer = (size: number) => {
  // best ever seen, not actually analytically solved
  if (size === 5) return 2.9066863505720963
  if (size === 10) return 3.1905528169320854
  if (size === 15) return 3.364314904214775
  if (size === 20) return 3.5097865199385443
  if (size === 30) return 4.234639438387794
  return 0
}

const runTrials = ({ size = 10, trials = 10, budget = 1e4, log = false }) => {
  console.log('traveling salesman problem, size', size)
  const answer = getAnswer(size)
  let bestSeen = Infinity
  const res = Array.from(Array(trials), () => {
    const { result, best, swaps, learnedK } = runTSP(size, budget)
    if (best < bestSeen) bestSeen = best
    const ok = result < answer + 0.00000001
    const resstr = result.toFixed(10)
    if (log) {
      if (ok) {
        console.log('   ok:', resstr, '   k', learnedK.toFixed(2), ' <--', swaps.join(' '))
      } else {
        console.log('== NG:', resstr, '   k', learnedK.toFixed(2), ' <--', swaps.join(' '))
      }
    }
    return ok
  }).filter((v) => v)

  console.log('   solved', ((100 * res.length) / trials).toFixed(0) + '%')
  if (answer === 0 || bestSeen < answer) {
    console.log('     update answer:  => ', bestSeen)
  }
  if (bestSeen > answer + 0.0001) {
    console.log('  best: ', bestSeen)
  }
}

runTrials({
  size: 15,
  trials: 20,
  budget: 1e5,
  log: false,
})

interface Methods<StateRef, MoveRef> {
  chooseMove(state: StateRef, iterNum: number): { move: MoveRef; errorDelta: number }
  applyMove(state: StateRef, move: MoveRef): StateRef
}

/**
 *
 * Simulated Annealing solver
 *
 */
export class AnnealingSolver<StateRef, MoveRef> {
  methods: Methods<StateRef, MoveRef>
  private _iterCt: number
  private _learnedCt: number
  private _shouldAbort: boolean

  /** Approximately how many iterations you plan to run */
  iterationBudget = 1e4

  /**
   * A constant that depends on the scale of your error values.
   * Tune this manually as a hyperparameter, or leave it as zero and
   * the library will try to choose a reasonable value.
   */
  k = 0

  /** Learned tuning value - used when `k` is `0` */
  learnedK = 0

  /**
   * Override this if you want to customize the temperature cooling schedule.
   * Should return 1 at the start and trend towards 0.
   * @param currIter The current iteration (starts at 0)
   */
  coolingFunction: (currIter: number, iterationBudget: number) => number

  constructor(params: Methods<StateRef, MoveRef>) {
    this.methods = params
    this.learnedK = 0
    this._iterCt = 0
    this._learnedCt = 0
    this._shouldAbort = false
    this.coolingFunction = AnnealingSolver.TEMP_EXPONENTIAL
  }

  reset() {
    this._iterCt = 0
    this.learnedK = 0
    this._learnedCt = 0
    this._shouldAbort = false
  }

  /** Call this to abandon a set of iterations (e.g. because a solution was found) */
  abort() {
    this._shouldAbort = true
  }

  get currentTemperature() {
    return this.coolingFunction(this._iterCt, this.iterationBudget)
  }

  /**
   * Temperature cooling schedules
   */
  static TEMP_LINEAR = (currIter: number, iterationBudget: number) => {
    // linear towards 0.01 at budget
    return 1 - 0.99 * (currIter / iterationBudget)
  }
  static TEMP_EXPONENTIAL = (currIter: number, iterationBudget: number) => {
    // exponential towards 0.01 at budget
    return Math.pow(0.01, currIter / iterationBudget)
  }

  /**
   * Run the solver for a given number of iterations.
   */
  run(state: StateRef, iterations = 100) {
    const { chooseMove, applyMove } = this.methods

    const max = this._iterCt + iterations
    let numMoves = 0
    while (this._iterCt < max) {
      const { move, errorDelta } = chooseMove(state, this._iterCt)
      let shouldApply = errorDelta <= 0
      if (!shouldApply) {
        const temp = this.coolingFunction(this._iterCt, this.iterationBudget)
        if (temp > 0) {
          const k = this.k > 0 ? this.k : this.learnK(errorDelta)
          const prob = Math.exp((-k * errorDelta) / temp)
          shouldApply = Math.random() < prob
        }
      }
      if (shouldApply) {
        state = applyMove(state, move)
        numMoves++
      }
      this._iterCt++
      if (this._shouldAbort) break
    }
    return { state, numMoves }
  }

  private learnK(errorDelta: number) {
    if (this._iterCt > 0.4 * this.iterationBudget) return this.learnedK

    // acceptance prob P for a given temp is:  P = exp((-k * errorDelta) / temp)
    // assume a given P at temp=1, and solve for k:
    //  ->  P = exp(-k * errorDelta)
    //  ->  log(P) = -k * errorDelta
    //  ->  k = -log(P)/errorDelta
    const k = -Math.log(0.7) / errorDelta

    // running average to learn a good k across various error values
    this._learnedCt++
    const frac = 1 / this._learnedCt
    this.learnedK = k * frac + this.learnedK * (1 - frac)

    return this.learnedK
  }
}

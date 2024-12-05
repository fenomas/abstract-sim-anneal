"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnealingSolver = void 0;
class AnnealingSolver {
    methods;
    _iterCt;
    _learnedCt;
    _shouldAbort;
    iterationBudget = 1e4;
    k = 0;
    learnedK = 0;
    coolingFunction;
    constructor(params) {
        this.methods = params;
        this.learnedK = 0;
        this._iterCt = 0;
        this._learnedCt = 0;
        this._shouldAbort = false;
        this.coolingFunction = AnnealingSolver.TEMP_EXPONENTIAL;
    }
    reset() {
        this._iterCt = 0;
        this.learnedK = 0;
        this._learnedCt = 0;
        this._shouldAbort = false;
    }
    abort() {
        this._shouldAbort = true;
    }
    get currentTemperature() {
        return this.coolingFunction(this._iterCt, this.iterationBudget);
    }
    static TEMP_LINEAR = (currIter, iterationBudget) => {
        return 1 - 0.99 * (currIter / iterationBudget);
    };
    static TEMP_EXPONENTIAL = (currIter, iterationBudget) => {
        return Math.pow(0.01, currIter / iterationBudget);
    };
    run(state, iterations = 100) {
        const { chooseMove, applyMove } = this.methods;
        const max = this._iterCt + iterations;
        let numMoves = 0;
        while (this._iterCt < max) {
            const { move, errorDelta } = chooseMove(state, this._iterCt);
            let shouldApply = errorDelta <= 0;
            if (!shouldApply) {
                const temp = this.coolingFunction(this._iterCt, this.iterationBudget);
                if (temp > 0) {
                    const k = this.k > 0 ? this.k : this.learnK(errorDelta);
                    const prob = Math.exp((-k * errorDelta) / temp);
                    shouldApply = Math.random() < prob;
                }
            }
            if (shouldApply) {
                state = applyMove(state, move);
                numMoves++;
            }
            this._iterCt++;
            if (this._shouldAbort)
                break;
        }
        return { state, numMoves };
    }
    learnK(errorDelta) {
        if (this._iterCt > 0.4 * this.iterationBudget)
            return this.learnedK;
        const k = -Math.log(0.7) / errorDelta;
        this._learnedCt++;
        const frac = 1 / this._learnedCt;
        this.learnedK = k * frac + this.learnedK * (1 - frac);
        return this.learnedK;
    }
}
exports.AnnealingSolver = AnnealingSolver;

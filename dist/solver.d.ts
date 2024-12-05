interface Methods<StateRef, MoveRef> {
    chooseMove(state: StateRef, iterNum: number): {
        move: MoveRef;
        errorDelta: number;
    };
    applyMove(state: StateRef, move: MoveRef): StateRef;
}
export declare class AnnealingSolver<StateRef, MoveRef> {
    methods: Methods<StateRef, MoveRef>;
    private _iterCt;
    private _learnedCt;
    private _shouldAbort;
    iterationBudget: number;
    k: number;
    learnedK: number;
    coolingFunction: (currIter: number, iterationBudget: number) => number;
    constructor(params: Methods<StateRef, MoveRef>);
    reset(): void;
    abort(): void;
    get currentTemperature(): number;
    static TEMP_LINEAR: (currIter: number, iterationBudget: number) => number;
    static TEMP_EXPONENTIAL: (currIter: number, iterationBudget: number) => number;
    run(state: StateRef, iterations?: number): {
        state: StateRef;
        numMoves: number;
    };
    private learnK;
}
export {};

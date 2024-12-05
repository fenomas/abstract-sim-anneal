# abstract-sim-anneal

Type-agnostic Simulated Annealing.

Doesn't care how your data is structured - just implement a minimal set of accessors,
and this module will apply [Simulated Annealing](https://en.wikipedia.org/wiki/Simulated_annealing)
to whatever constraint problem you're solving.

### Installation:

```shell
pnpm i abstract-sim-anneal  # or npm/yarn/etc
```

### Usage:

```ts
const solver = new AnnealingSolver<StateType, MoveType>({
  chooseMove: (state) => {
    // given a state, return a candidate move and the error it would cause
    return { move: someMove, errorDelta: someNumber }
  },
  applyMove: (state, move) => {
    // apply a candidate move and return the resulting state
    return newState
  },
})
solver.iterationBudget = 1000
const resultState = solver.run(someInitialState, 1000)
```

### By:

Made with 🍺 by [fenomas](https://fenomas.com).

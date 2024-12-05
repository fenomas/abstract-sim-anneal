import { describe, it } from 'node:test'
import { strictEqual, doesNotThrow } from 'node:assert'

import { AnnealingSolver } from './solver'

describe('abstract SA', () => {
  it('should not throw', () => {
    doesNotThrow(() => {
      const s = new AnnealingSolver<string, number>({
        chooseMove: (state = 'a') => ({ move: 1, errorDelta: -1 }),
        applyMove: (state = 'b', move = 1) => state + move,
      })
      s.iterationBudget = 5
      const { state } = s.run('q', 1)
      strictEqual(state, 'q1')
    })
  })
})

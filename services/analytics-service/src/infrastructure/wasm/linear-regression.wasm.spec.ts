/// <reference types="jest" />

import { linearRegression } from "./linear-regression.wasm";

describe("linearRegression WASM adapter", () => {
  it("calculates slope and intercept using the WebAssembly module", () => {
    const result = linearRegression([5, 6, 9]);

    expect(result.slope).toBeCloseTo(2);
    expect(result.intercept).toBeCloseTo(8 / 3);
  });

  it("handles a constant series", () => {
    expect(linearRegression([7, 7, 7])).toEqual({ slope: 0, intercept: 7 });
  });
});

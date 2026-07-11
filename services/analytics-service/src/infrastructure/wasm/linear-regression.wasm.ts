export interface LinearRegressionResult {
  slope: number;
  intercept: number;
}

type LinearRegressionExport = (
  n: number,
  sumX: number,
  sumY: number,
  sumXY: number,
  sumXX: number,
) => [number, number];

/*
 * Precompiled WebAssembly module for this WAT source:
 *
 * (module
 *   (func (export "linear_regression")
 *     (param $n f64) (param $sum_x f64) (param $sum_y f64)
 *     (param $sum_xy f64) (param $sum_xx f64) (result f64 f64)
 *     (local $denom f64) (local $slope f64)
 *     local.get $n local.get $sum_xx f64.mul
 *     local.get $sum_x local.get $sum_x f64.mul f64.sub local.set $denom
 *     local.get $denom f64.const 0 f64.eq
 *     if (result f64) f64.const 0
 *     else
 *       local.get $n local.get $sum_xy f64.mul
 *       local.get $sum_x local.get $sum_y f64.mul f64.sub
 *       local.get $denom f64.div
 *     end
 *     local.tee $slope
 *     local.get $sum_y local.get $slope local.get $sum_x f64.mul f64.sub
 *     local.get $n f64.div))
 *
 * Keeping the bytes here avoids adding a Rust/AssemblyScript toolchain for one
 * small function and works in every Node version supported by this service.
 */
const WASM_BYTES = Uint8Array.from([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 11, 1, 96, 5, 124, 124, 124, 124, 124,
  2, 124, 124, 3, 2, 1, 0, 7, 21, 1, 17, 108, 105, 110, 101, 97, 114, 95,
  114, 101, 103, 114, 101, 115, 115, 105, 111, 110, 0, 0, 10, 71, 1, 69, 1,
  2, 124, 32, 0, 32, 4, 162, 32, 1, 32, 1, 162, 161, 33, 5, 32, 5, 68, 0,
  0, 0, 0, 0, 0, 0, 0, 97, 4, 124, 68, 0, 0, 0, 0, 0, 0, 0, 0, 5, 32,
  0, 32, 3, 162, 32, 1, 32, 2, 162, 161, 32, 5, 163, 11, 34, 6, 32, 2, 32,
  6, 32, 1, 162, 161, 32, 0, 163, 11,
]);

let wasmRegression: LinearRegressionExport | null | undefined;

interface WebAssemblyApi {
  Module: new (bytes: Uint8Array) => unknown;
  Instance: new (module: unknown) => {
    exports: Record<string, unknown>;
  };
}

function loadWasmRegression(): LinearRegressionExport | null {
  if (wasmRegression !== undefined) return wasmRegression;

  try {
    const wasmApi = (globalThis as unknown as { WebAssembly: WebAssemblyApi }).WebAssembly;
    const module = new wasmApi.Module(WASM_BYTES);
    const instance = new wasmApi.Instance(module);
    wasmRegression = instance.exports.linear_regression as LinearRegressionExport;
  } catch {
    // Preserve service availability on runtimes where WebAssembly is disabled.
    wasmRegression = null;
  }

  return wasmRegression;
}

export function linearRegression(values: readonly number[]): LinearRegressionResult {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let index = 0; index < n; index += 1) {
    const x = index + 1;
    const y = values[index];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const wasm = loadWasmRegression();
  if (wasm) {
    const [slope, intercept] = wasm(n, sumX, sumY, sumXY, sumXX);
    return { slope, intercept };
  }

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  return { slope, intercept: (sumY - slope * sumX) / n };
}

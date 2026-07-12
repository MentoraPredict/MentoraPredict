export const MAX_CONFETTI_PARTICLES = 512;
const FLOATS_PER_PARTICLE = 5; // x, y, vx, vy, life

export interface ConfettiEngine {
  /** View over the module's linear memory: [x, y, vx, vy, life] per particle. */
  memory: Float32Array;
  step: (count: number, dt: number, gravity: number) => void;
}

/*
 * Precompiled WebAssembly bytes, compiled from ./confetti-particles.c with:
 *
 *   clang --target=wasm32 -O2 -nostdlib \
 *     -Wl,--no-entry -Wl,--export=step -Wl,--export=get_particles_ptr -Wl,--export-memory \
 *     -o confetti-particles.wasm confetti-particles.c
 *
 * Keeping the compiled bytes here avoids requiring the LLVM toolchain at
 * runtime or in CI; regenerate by recompiling the .c file and pasting the
 * new bytes below. This file intentionally does NOT end in ".wasm" (unlike
 * the backend's linear-regression.wasm.ts) — Vite's build pipeline treats a
 * bare "*.wasm" import specifier as a binary asset, which shadows a same-named
 * ".wasm.ts" module and breaks named exports.
 */
const WASM_BYTES = Uint8Array.from([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 11, 2, 96, 0, 1, 127, 96,
  3, 127, 125, 125, 0, 3, 3, 2, 0, 1, 4, 5, 1, 112, 1, 1,
  1, 5, 3, 1, 0, 2, 6, 8, 1, 127, 1, 65, 128, 128, 4, 11,
  7, 37, 3, 6, 109, 101, 109, 111, 114, 121, 2, 0, 17, 103, 101, 116,
  95, 112, 97, 114, 116, 105, 99, 108, 101, 115, 95, 112, 116, 114, 0, 0,
  4, 115, 116, 101, 112, 0, 1, 10, 159, 1, 2, 8, 0, 65, 128, 128,
  132, 128, 0, 11, 147, 1, 3, 1, 127, 1, 125, 1, 127, 2, 64, 32,
  0, 65, 1, 72, 13, 0, 32, 0, 65, 128, 4, 32, 0, 65, 128, 4,
  72, 27, 33, 3, 65, 128, 128, 132, 128, 0, 33, 0, 32, 2, 32, 1,
  148, 33, 4, 3, 64, 32, 0, 65, 12, 106, 34, 5, 32, 4, 32, 5,
  42, 2, 0, 146, 34, 2, 56, 2, 0, 32, 0, 65, 16, 106, 34, 5,
  32, 5, 42, 2, 0, 32, 1, 147, 56, 2, 0, 32, 0, 32, 0, 65,
  8, 106, 42, 2, 0, 32, 1, 148, 32, 0, 42, 2, 0, 146, 56, 2,
  0, 32, 0, 65, 4, 106, 34, 5, 32, 2, 32, 1, 148, 32, 5, 42,
  2, 0, 146, 56, 2, 0, 32, 0, 65, 20, 106, 33, 0, 32, 3, 65,
  127, 106, 34, 3, 13, 0, 11, 11, 11, 0, 79, 4, 110, 97, 109, 101,
  0, 24, 23, 99, 111, 110, 102, 101, 116, 116, 105, 45, 112, 97, 114, 116,
  105, 99, 108, 101, 115, 46, 119, 97, 115, 109, 1, 26, 2, 0, 17, 103,
  101, 116, 95, 112, 97, 114, 116, 105, 99, 108, 101, 115, 95, 112, 116, 114,
  1, 4, 115, 116, 101, 112, 7, 18, 1, 0, 15, 95, 95, 115, 116, 97,
  99, 107, 95, 112, 111, 105, 110, 116, 101, 114, 0, 118, 9, 112, 114, 111,
  100, 117, 99, 101, 114, 115, 1, 12, 112, 114, 111, 99, 101, 115, 115, 101,
  100, 45, 98, 121, 1, 5, 99, 108, 97, 110, 103, 86, 50, 50, 46, 49,
  46, 56, 32, 40, 104, 116, 116, 112, 115, 58, 47, 47, 103, 105, 116, 104,
  117, 98, 46, 99, 111, 109, 47, 108, 108, 118, 109, 47, 108, 108, 118, 109,
  45, 112, 114, 111, 106, 101, 99, 116, 32, 99, 97, 55, 57, 51, 51, 101,
  52, 55, 100, 51, 97, 51, 52, 53, 49, 100, 56, 49, 101, 55, 50, 97,
  99, 49, 55, 52, 100, 99, 98, 53, 97, 97, 50, 56, 98, 53, 57, 100,
  49, 41, 0, 148, 1, 15, 116, 97, 114, 103, 101, 116, 95, 102, 101, 97,
  116, 117, 114, 101, 115, 8, 43, 11, 98, 117, 108, 107, 45, 109, 101, 109,
  111, 114, 121, 43, 15, 98, 117, 108, 107, 45, 109, 101, 109, 111, 114, 121,
  45, 111, 112, 116, 43, 22, 99, 97, 108, 108, 45, 105, 110, 100, 105, 114,
  101, 99, 116, 45, 111, 118, 101, 114, 108, 111, 110, 103, 43, 10, 109, 117,
  108, 116, 105, 118, 97, 108, 117, 101, 43, 15, 109, 117, 116, 97, 98, 108,
  101, 45, 103, 108, 111, 98, 97, 108, 115, 43, 19, 110, 111, 110, 116, 114,
  97, 112, 112, 105, 110, 103, 45, 102, 112, 116, 111, 105, 110, 116, 43, 15,
  114, 101, 102, 101, 114, 101, 110, 99, 101, 45, 116, 121, 112, 101, 115, 43,
  8, 115, 105, 103, 110, 45, 101, 120, 116,
]);

interface ConfettiExports {
  memory: WebAssembly.Memory;
  get_particles_ptr: () => number;
  step: (count: number, dt: number, gravity: number) => void;
}

interface WebAssemblyApi {
  Module: new (bytes: Uint8Array) => unknown;
  Instance: new (module: unknown) => { exports: Record<string, unknown> };
}

let cachedEngine: ConfettiEngine | null | undefined;

export function loadConfettiEngine(): ConfettiEngine | null {
  if (cachedEngine !== undefined) return cachedEngine;

  try {
    const wasmApi = (globalThis as unknown as { WebAssembly: WebAssemblyApi }).WebAssembly;
    const module = new wasmApi.Module(WASM_BYTES);
    const instance = new wasmApi.Instance(module) as unknown as { exports: ConfettiExports };
    const { memory, get_particles_ptr, step } = instance.exports;
    const ptr = get_particles_ptr();
    const view = new Float32Array(memory.buffer, ptr, MAX_CONFETTI_PARTICLES * FLOATS_PER_PARTICLE);
    cachedEngine = { memory: view, step };
  } catch {
    // Preserve UI availability on runtimes where WebAssembly is disabled.
    cachedEngine = null;
  }

  return cachedEngine;
}

/*
 * Freestanding C module compiled to WebAssembly (target wasm32, no libc).
 * Powers the confetti burst animation: advances position/velocity for a
 * batch of particles under gravity every animation frame, entirely inside
 * WASM linear memory.
 *
 * Build (requires LLVM/clang with wasm32 support, e.g. `winget install LLVM.LLVM`):
 *
 *   clang --target=wasm32 -O2 -nostdlib \
 *     -Wl,--no-entry -Wl,--export=step -Wl,--export=get_particles_ptr -Wl,--export-memory \
 *     -o confetti-particles.wasm confetti-particles.c
 *
 * Color/rotation/size stay on the JS side (small, non-performance-sensitive
 * per-particle metadata); only the physics integration runs in WASM.
 */

#define MAX_PARTICLES 512

typedef struct {
  float x;
  float y;
  float vx;
  float vy;
  float life;
} Particle;

static Particle particles[MAX_PARTICLES];

__attribute__((export_name("get_particles_ptr")))
Particle *get_particles_ptr(void) {
  return particles;
}

__attribute__((export_name("step")))
void step(int count, float dt, float gravity) {
  if (count > MAX_PARTICLES) {
    count = MAX_PARTICLES;
  }

  for (int i = 0; i < count; i++) {
    particles[i].vy += gravity * dt;
    particles[i].x += particles[i].vx * dt;
    particles[i].y += particles[i].vy * dt;
    particles[i].life -= dt;
  }
}

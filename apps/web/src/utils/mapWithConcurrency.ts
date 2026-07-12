// Runs mapFn over items with at most `limit` in flight at once, instead of
// firing every item's requests simultaneously (Promise.all's default). Each
// item can itself fire multiple parallel requests (e.g. a subject's
// metrics/risk/alerts/prediction calls), so capping how many items run
// concurrently is what actually bounds the peak request burst against the
// backend.
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapFn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapFn(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

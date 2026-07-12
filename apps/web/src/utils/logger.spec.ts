import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "./logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes a structured info entry", () => {
    const consoleSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);

    logger.info("Courses loaded", { courseCount: 3 });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        message: "Courses loaded",
        courseCount: 3,
        timestamp: expect.any(String),
      }),
    );
  });

  it("serializes errors without losing their message", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    logger.error("Courses failed", new Error("Network error"), {
      status: 500,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "error",
        message: "Courses failed",
        status: 500,
        error: expect.objectContaining({
          name: "Error",
          message: "Network error",
        }),
      }),
    );
  });
});

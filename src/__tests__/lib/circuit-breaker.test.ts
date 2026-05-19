import {CircuitBreaker} from "@/lib/circuit-breaker";

describe("CircuitBreaker", () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker({failureThreshold: 3, timeout: 1000, name: "test"});
    jest.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts in CLOSED state", () => {
      expect(cb.getState()).toBe("CLOSED");
    });

    it("reports zero failures in initial stats", () => {
      const stats = cb.getStats();
      expect(stats.failureCount).toBe(0);
      expect(stats.lastFailureTime).toBeNull();
    });

    it("reports the configured name in stats", () => {
      expect(cb.getStats().name).toBe("test");
    });

    it("uses 'unknown' as default name when none provided", () => {
      const defaultCb = new CircuitBreaker();
      expect(defaultCb.getStats().name).toBe("unknown");
    });
  });

  describe("execute() in CLOSED state", () => {
    it("returns the resolved value from the wrapped function", async () => {
      const result = await cb.execute(() => Promise.resolve(42));
      expect(result).toBe(42);
    });

    it("propagates errors thrown by the wrapped function", async () => {
      const err = new Error("service error");
      await expect(cb.execute(() => Promise.reject(err))).rejects.toThrow("service error");
    });

    it("increments failure count on each error", async () => {
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      expect(cb.getStats().failureCount).toBe(1);

      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      expect(cb.getStats().failureCount).toBe(2);
    });

    it("resets failure count to zero after a successful call", async () => {
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      await cb.execute(() => Promise.resolve("ok"));
      expect(cb.getStats().failureCount).toBe(0);
    });

    it("records lastFailureTime after a failure", async () => {
      const before = Date.now();
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      const stats = cb.getStats();
      expect(stats.lastFailureTime).not.toBeNull();
      const failureMs = new Date(stats.lastFailureTime!).getTime();
      expect(failureMs).toBeGreaterThanOrEqual(before);
    });
  });

  describe("state transitions: CLOSED → OPEN", () => {
    it("opens after reaching the failure threshold", async () => {
      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
      expect(cb.getState()).toBe("OPEN");
    });

    it("does not open before reaching the failure threshold", async () => {
      for (let i = 0; i < 2; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
      expect(cb.getState()).toBe("CLOSED");
    });
  });

  describe("execute() in OPEN state", () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
    });

    it("throws immediately with 'Circuit breaker OPEN' message before timeout", async () => {
      await expect(cb.execute(() => Promise.resolve("ok"))).rejects.toThrow("Circuit breaker OPEN");
    });

    it("does not invoke the wrapped function while OPEN", async () => {
      const fn = jest.fn().mockResolvedValue("result");
      await cb.execute(fn).catch(() => {});
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("state transitions: OPEN → HALF_OPEN", () => {
    it("transitions to HALF_OPEN after the timeout elapses", async () => {
      const fixedTime = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(fixedTime);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
      expect(cb.getState()).toBe("OPEN");

      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 1001);
      await cb.execute(() => Promise.resolve("ok")).catch(() => {});

      expect(cb.getState()).toBe("HALF_OPEN");
    });

    it("remains OPEN when timeout has not elapsed", async () => {
      const fixedTime = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(fixedTime);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }

      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 500); // only 500ms elapsed
      await cb.execute(() => Promise.resolve("ok")).catch(() => {});

      expect(cb.getState()).toBe("OPEN");
    });
  });

  describe("state transitions: HALF_OPEN → CLOSED", () => {
    it("closes after two consecutive successes in HALF_OPEN state", async () => {
      const fixedTime = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(fixedTime);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }

      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 1001);

      await cb.execute(() => Promise.resolve("first success"));
      expect(cb.getState()).toBe("HALF_OPEN");

      await cb.execute(() => Promise.resolve("second success"));
      expect(cb.getState()).toBe("CLOSED");
    });

    it("stays in HALF_OPEN after only one success", async () => {
      const fixedTime = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(fixedTime);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }

      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 1001);
      await cb.execute(() => Promise.resolve("one success"));
      expect(cb.getState()).toBe("HALF_OPEN");
    });
  });

  describe("state transitions: HALF_OPEN → OPEN", () => {
    it("reverts to OPEN immediately on failure in HALF_OPEN state", async () => {
      const fixedTime = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(fixedTime);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }

      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 1001);
      await cb.execute(() => Promise.resolve("ok")).catch(() => {});
      expect(cb.getState()).toBe("HALF_OPEN");

      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 1002);
      await cb.execute(() => Promise.reject(new Error("fail again"))).catch(() => {});
      expect(cb.getState()).toBe("OPEN");
    });
  });

  describe("reset()", () => {
    it("resets state to CLOSED after being OPEN", async () => {
      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
      cb.reset();
      expect(cb.getState()).toBe("CLOSED");
    });

    it("clears the failure count", async () => {
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      cb.reset();
      expect(cb.getStats().failureCount).toBe(0);
    });

    it("clears lastFailureTime", async () => {
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      cb.reset();
      expect(cb.getStats().lastFailureTime).toBeNull();
    });

    it("allows successful execution after reset from OPEN state", async () => {
      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
      cb.reset();
      const result = await cb.execute(() => Promise.resolve("recovered"));
      expect(result).toBe("recovered");
    });
  });

  describe("getStats()", () => {
    it("returns a snapshot of the circuit state, failureCount, lastFailureTime, and name", async () => {
      const stats = cb.getStats();
      expect(stats).toHaveProperty("state");
      expect(stats).toHaveProperty("failureCount");
      expect(stats).toHaveProperty("lastFailureTime");
      expect(stats).toHaveProperty("name");
    });

    it("returns lastFailureTime as a valid ISO string after a failure", async () => {
      await cb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      const {lastFailureTime} = cb.getStats();
      expect(lastFailureTime).not.toBeNull();
      expect(new Date(lastFailureTime!).toISOString()).toBe(lastFailureTime);
    });
  });

  describe("default options", () => {
    it("uses a default failureThreshold of 5", async () => {
      const defaultCb = new CircuitBreaker();
      for (let i = 0; i < 4; i++) {
        await defaultCb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }
      expect(defaultCb.getState()).toBe("CLOSED");

      await defaultCb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      expect(defaultCb.getState()).toBe("OPEN");
    });

    it("uses a default timeout of 60 seconds", async () => {
      const defaultCb = new CircuitBreaker();
      const fixedTime = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(fixedTime);

      for (let i = 0; i < 5; i++) {
        await defaultCb.execute(() => Promise.reject(new Error("fail"))).catch(() => {});
      }

      // 59s elapsed — still OPEN
      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 59000);
      await defaultCb.execute(() => Promise.resolve("ok")).catch(() => {});
      expect(defaultCb.getState()).toBe("OPEN");

      // 61s elapsed — should transition to HALF_OPEN
      jest.spyOn(Date, "now").mockReturnValue(fixedTime + 61000);
      await defaultCb.execute(() => Promise.resolve("ok")).catch(() => {});
      expect(defaultCb.getState()).toBe("HALF_OPEN");
    });
  });
});
